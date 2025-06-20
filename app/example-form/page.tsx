// app/example-form/page.tsx
"use client"
import * as React from "react"
import { Input } from "@/components/ui/input"

export default function ExampleFormPage() {
  const [firstName, setFirstName] = React.useState("")
  const [email,    setEmail]    = React.useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert(`Submitting…\nName: ${firstName}\nEmail: ${email}`)
  }

  return (
    <main className="max-w-md mx-auto mt-12 p-4">
      <h1 className="text-2xl font-bold mb-6">Example Form</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="firstName" className="block mb-1 font-medium">
            First Name
          </label>
          <Input
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Enter your first name"
          />
        </div>

        <div>
          <label htmlFor="email" className="block mb-1 font-medium">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Submit
        </button>
      </form>
    </main>
  )
}
