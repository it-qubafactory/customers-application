import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js'

const supabaseUrl = 'https://cdarkdavgieiimuoptkt.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkYXJrZGF2Z2llaWltdW9wdGt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyOTY0NTgsImV4cCI6MjA2OTg3MjQ1OH0.wx7fvU8-dmFQGUZYeSA0FbgszRKaZFWCBH5cDSgJsiw'
const supabase = createClient(supabaseUrl, supabaseKey)

const loginForm = document.getElementById('login-form')
const msg = document.getElementById('message')
const loginBtn = loginForm.querySelector('button[type="submit"]')

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  loginBtn.disabled = true
  msg.textContent = '⏳ Logging in...'

  const email = document.getElementById('login-email').value
  const password = document.getElementById('login-password').value

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      msg.textContent = '❌ ' + error.message
    } else {
      msg.textContent = '✅ Login successful!'
      setTimeout(() => {
        window.location.href = 'index.html'
      }, 1000)
    }
  } catch (err) {
    msg.textContent = '❌ Unexpected error: ' + err.message
  } finally {
    loginBtn.disabled = false
  }
})
