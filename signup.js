import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js'

const supabaseUrl = SUPABASE_URL
const supabaseKey = SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

const signupForm = document.getElementById('signup-form')
const signupBtn = signupForm.querySelector('button[type="submit"]')
const msg = document.getElementById('message')

signupForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  signupBtn.disabled = true
  msg.textContent = '⏳ Signing up...'

  const email = document.getElementById('signup-email').value
  const password = document.getElementById('signup-password').value

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