
const COLORS = ['#3498db', '#e74c3c', '#f39c12', '#2ecc71', '#9b59b6', '#1abc9c', '#e67e22', '#34495e']

function VisualizationPanel({ visualization, onClose }) {
  if (!visualization || !visualization.canVisualize) {
    return null
  }

  const renderChart = () => {
    switch (visualization.visualizationType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={visualization.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3498db" />
            </BarChart>
          </ResponsiveContainer>
        )

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={visualization.data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {visualization.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={visualization.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#3498db" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )

      default:
        return <div className="no-chart">Chart type not supported</div>
    }
  }

  return (
    <div className="visualization-panel">
      <div className="panel-header">
        <h3>{visualization.title}</h3>
        <button className="close-btn" onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      <div className="panel-content">
        {renderChart()}

        <div className="reasoning">
          <p><strong>Why this visualization:</strong> {visualization.reasoning}</p>
        </div>

        <div className="data-summary">
          <p><strong>Data points:</strong> {visualization.data.length}</p>
        </div>
      </div>
    </div>
  )
}

export default VisualizationPanel