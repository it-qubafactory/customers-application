import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js'

const supabaseUrl = 'https://cdarkdavgieiimuoptkt.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkYXJrZGF2Z2llaWltdW9wdGt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyOTY0NTgsImV4cCI6MjA2OTg3MjQ1OH0.wx7fvU8-dmFQGUZYeSA0FbgszRKaZFWCBH5cDSgJsiw'
const supabase = createClient(supabaseUrl, supabaseKey)

const signupForm = document.getElementById('signup-form')
const signupBtn = signupForm.querySelector('button[type="submit"]')
const msg = document.getElementById('message')

signupForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  signupBtn.disabled = true
  msg.textContent = '⏳ Signing up...'

  const email = document.getElementById('email').value
  const password = document.getElementById('password').value

  try {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      msg.textContent = '❌ ' + error.message
    } else {
      msg.textContent = '✅ Confirmation email sent. Check your inbox!'
      console.log('Signup successful:', data)
    }
  } catch (err) {
    msg.textContent = '❌ Unexpected error: ' + err.message
  } finally {
    signupBtn.disabled = false
  }
})
