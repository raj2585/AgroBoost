import React from 'react'

export default function Footer() {
  return (
    <footer className="py-8 bg-green-800 text-white">
    <div className="container mx-auto px-4 text-center">
      <div className="mb-4">
        <a href="#" className="mx-2 hover:underline">Home</a>
        <a href="#" className="mx-2 hover:underline">Features</a>
        <a href="#" className="mx-2 hover:underline">Contact</a>
        <a href="#" className="mx-2 hover:underline">Privacy Policy</a>
      </div>
      <div className="mb-4">
        <a href="#" className="mx-2 hover:underline">Facebook</a>
        <a href="#" className="mx-2 hover:underline">Twitter</a>
        <a href="#" className="mx-2 hover:underline">Instagram</a>
      </div>
      <p>© 2025 AgroBoost. All Rights Reserved.</p>
    </div>
  </footer>
  )
}
