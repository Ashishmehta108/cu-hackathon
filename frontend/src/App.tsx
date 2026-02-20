import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Navbar } from "./components/Navbar"
import { Home } from "./pages/Home"
import { RecordComplaint } from "./pages/RecordComplaint"
import { Dashboard } from "./pages/Dashboard"
import { Wiki } from "./pages/Wiki"
import { RecordWiki } from "./pages/RecordWiki"
import { ComplaintDetail } from "./pages/ComplaintDetail"

function App() {
  return (
    <BrowserRouter>
      <div className="relative min-h-screen bg-background font-sans text-foreground antialiased selection:bg-primary/20">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/record-complaint" element={<RecordComplaint />} />
            <Route path="/complaint/:id" element={<ComplaintDetail />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/wiki" element={<Wiki />} />
            <Route path="/record-wiki" element={<RecordWiki />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
