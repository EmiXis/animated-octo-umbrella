import { useEffect, useMemo, useState } from 'react'
import './App.css'

const API_BASE_URL = 'http://localhost:3001'

const ENTITY_CONFIGS = [
  {
    resource: 'estudiantes',
    title: 'Estudiantes',
    fields: [
      { key: 'nombre', label: 'Nombre', type: 'text' },
      { key: 'email', label: 'Email', type: 'email' },
    ],
  },
  {
    resource: 'cursos',
    title: 'Cursos',
    fields: [
      { key: 'nombre', label: 'Nombre del curso', type: 'text' },
      { key: 'creditos', label: 'Créditos', type: 'number' },
    ],
  },
  {
    resource: 'inscripciones',
    title: 'Inscripciones',
    fields: [
      {
        key: 'estudianteId',
        label: 'Estudiante',
        type: 'text',
        optionsFrom: 'estudiantes',
        optionLabel: 'nombre',
      },
      {
        key: 'cursoId',
        label: 'Curso',
        type: 'text',
        optionsFrom: 'cursos',
        optionLabel: 'nombre',
      },
      { key: 'semestre', label: 'Semestre', type: 'text' },
    ],
  },
]

const createInitialFormState = (fields) =>
  fields.reduce((formState, field) => {
    formState[field.key] = ''
    return formState
  }, {})

const parseFieldValue = (field, value) => {
  if (field.optionsFrom) {
    return value
  }
  return field.type === 'number' && value !== '' ? Number(value) : value
}

function EntityCrud({ config, data, onReload }) {
  const initialFormState = useMemo(
    () => createInitialFormState(config.fields),
    [config.fields],
  )
  const [formState, setFormState] = useState(initialFormState)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const resolveRelatedLabel = (field, value) => {
    if (!field.optionsFrom) {
      return value
    }

    const relatedData = data[field.optionsFrom]
    const relatedItem = relatedData.find(
      (item) => String(item.id) === String(value),
    )
    return relatedItem ? relatedItem[field.optionLabel] : value
  }

  const handleInputChange = (key, value) => {
    setFormState((currentState) => ({ ...currentState, [key]: value }))
  }

  const resetForm = () => {
    setFormState(initialFormState)
    setEditingId(null)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const payload = config.fields.reduce((nextPayload, field) => {
        nextPayload[field.key] = parseFieldValue(field, formState[field.key])
        return nextPayload
      }, {})

      const endpoint = editingId
        ? `${API_BASE_URL}/${config.resource}/${editingId}`
        : `${API_BASE_URL}/${config.resource}`
      const method = editingId ? 'PUT' : 'POST'
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingId ? { id: editingId, ...payload } : payload),
      })

      if (!response.ok) {
        throw new Error('No se pudo guardar el registro')
      }

      resetForm()
      await onReload(config.resource)
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (row) => {
    const nextFormState = config.fields.reduce((nextState, field) => {
      nextState[field.key] = row[field.key]
      return nextState
    }, {})

    setFormState(nextFormState)
    setEditingId(row.id)
  }

  const handleDelete = async (id) => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE_URL}/${config.resource}/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('No se pudo eliminar el registro')
      }
      await onReload(config.resource)
      if (editingId === id) {
        resetForm()
      }
    } catch (deleteError) {
      setError(deleteError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="w3-card w3-white w3-padding">
      <h2 className="w3-xlarge">{config.title}</h2>

      <form className="form-grid" onSubmit={handleSubmit}>
        {config.fields.map((field) => (
          <label key={field.key} className="w3-block">
            {field.label}
            {field.optionsFrom ? (
              <select
                className="w3-select w3-border"
                value={formState[field.key]}
                onChange={(event) => handleInputChange(field.key, event.target.value)}
                required
              >
                <option value="" disabled>
                  Seleccione una opción
                </option>
                {data[field.optionsFrom].map((item) => (
                  <option key={item.id} value={item.id}>
                    {item[field.optionLabel]}
                  </option>
                ))}
              </select>
            ) : (
              <input
                className="w3-input w3-border"
                type={field.type}
                value={formState[field.key]}
                onChange={(event) => handleInputChange(field.key, event.target.value)}
                required
              />
            )}
          </label>
        ))}
        <div className="button-group">
          <button className="w3-button w3-blue" type="submit" disabled={loading}>
            {editingId ? 'Actualizar' : 'Crear'}
          </button>
          <button
            className="w3-button w3-light-grey"
            type="button"
            onClick={resetForm}
            disabled={loading}
          >
            Limpiar
          </button>
        </div>
      </form>

      {error && <p className="w3-text-red">{error}</p>}

      <div className="table-wrapper">
        <table className="w3-table-all w3-small">
          <thead>
            <tr className="w3-light-grey">
              <th>ID</th>
              {config.fields.map((field) => (
                <th key={field.key}>{field.label}</th>
              ))}
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data[config.resource].length === 0 && (
              <tr>
                <td colSpan={config.fields.length + 2}>No hay registros</td>
              </tr>
            )}
            {data[config.resource].map((row) => (
              <tr key={row.id}>
                <td>{row.id}</td>
                {config.fields.map((field) => (
                  <td key={field.key}>{resolveRelatedLabel(field, row[field.key])}</td>
                ))}
                <td>
                  <div className="button-group">
                    <button
                      className="w3-button w3-green w3-small"
                      type="button"
                      onClick={() => handleEdit(row)}
                    >
                      Editar
                    </button>
                    <button
                      className="w3-button w3-red w3-small"
                      type="button"
                      onClick={() => handleDelete(row.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function App() {
  const [data, setData] = useState({
    estudiantes: [],
    cursos: [],
    inscripciones: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadEntity = async (resource) => {
    const response = await fetch(`${API_BASE_URL}/${resource}`)
    if (!response.ok) {
      throw new Error(`No se pudo cargar ${resource}`)
    }
    const records = await response.json()
    setData((currentData) => ({ ...currentData, [resource]: records }))
  }

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true)
      setError('')
      try {
        await Promise.all(ENTITY_CONFIGS.map((config) => loadEntity(config.resource)))
      } catch (loadError) {
        setError(loadError.message)
      } finally {
        setLoading(false)
      }
    }

    loadInitialData()
  }, [])

  return (
    <main className="w3-container">
      <header className="w3-panel w3-blue">
        <h1>Gestión Académica</h1>
        <p>CRUD de Estudiantes, Cursos e Inscripciones con React + json-server.</p>
      </header>

      {error && <p className="w3-text-red">{error}</p>}
      {loading ? (
        <p className="w3-center">Cargando información...</p>
      ) : (
        <div className="panel-grid">
          {ENTITY_CONFIGS.map((config) => (
            <EntityCrud
              key={config.resource}
              config={config}
              data={data}
              onReload={loadEntity}
            />
          ))}
        </div>
      )}
    </main>
  )
}

export default App
