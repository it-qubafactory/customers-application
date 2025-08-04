import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js'

const supabaseUrl = SUPABASE_URL
const supabaseKey = SUPABASE_ANON_KEY
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
