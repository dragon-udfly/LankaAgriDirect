import { useEffect, useState } from 'react'
import axios from 'axios'

function App() {
  const [message, setMessage] = useState('Loading...')

  useEffect(() => {
    // Replace with your actual backend URL
    axios.get('http://localhost:8080/api/hello')
        .then(response => setMessage(response.data))
        .catch(error => setMessage('Error connecting to backend'))
  }, [])

  return (
      <div>
        <h1>Lanka Agri Direct</h1>
        <p>Backend Status: {message}</p>
      </div>
  )
}

export default App