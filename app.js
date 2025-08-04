import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js'

const supabaseUrl = 'https://cdarkdavgieiimuoptkt.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkYXJrZGF2Z2llaWltdW9wdGt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyOTY0NTgsImV4cCI6MjA2OTg3MjQ1OH0.wx7fvU8-dmFQGUZYeSA0FbgszRKaZFWCBH5cDSgJsiw'
const supabase = createClient(supabaseUrl, supabaseKey)

const logoutBtn = document.getElementById('logout-btn')
const customerForm = document.getElementById('customer-form')
const nameInput = document.getElementById('name')
const emailInput = document.getElementById('email')
const phonesContainer = document.getElementById('phones-container')
const addPhoneBtn = document.getElementById('add-phone-btn')
const addressesContainer = document.getElementById('addresses-container')
const addAddressBtn = document.getElementById('add-address-btn')
const notesInput = document.getElementById('notes')
const searchInput = document.getElementById('search')
const sortBySelect = document.getElementById('sort-by')
const sortDirSelect = document.getElementById('sort-dir')
const customerList = document.getElementById('customer-list')
const prevPageBtn = document.getElementById('prev-page')
const nextPageBtn = document.getElementById('next-page')
const pageInfo = document.getElementById('page-info')

const editModal = document.getElementById('edit-modal')
const editForm = document.getElementById('edit-form')
const editNameInput = document.getElementById('edit-name')
const editEmailInput = document.getElementById('edit-email')
const editPhonesContainer = document.getElementById('edit-phones-container')
const editAddPhoneBtn = document.getElementById('edit-add-phone-btn')
const editAddressesContainer = document.getElementById('edit-addresses-container')
const editAddAddressBtn = document.getElementById('edit-add-address-btn')
const editNotesInput = document.getElementById('edit-notes')
const editCancelBtn = document.getElementById('edit-cancel-btn')

let currentPage = 0
const pageSize = 5
let totalCustomers = 0
let lastSearch = ''
let lastSortBy = 'created_at'
let lastSortDir = 'desc'

// Logout
logoutBtn.onclick = async () => {
  await supabase.auth.signOut()
  window.location.href = '/login.html'
}

// Add new phone input (add customer form)
addPhoneBtn.onclick = () => {
  const input = document.createElement('input')
  input.type = 'text'
  input.placeholder = 'Phone (required)'
  input.classList.add('phone-input')
  input.required = true
  phonesContainer.appendChild(input)
}

// Add new address inputs (add customer form)
addAddressBtn.onclick = () => {
  const addressInput = document.createElement('input')
  addressInput.type = 'text'
  addressInput.placeholder = 'Address'
  addressInput.classList.add('address-input')

  const locationInput = document.createElement('input')
  locationInput.type = 'text'
  locationInput.placeholder = 'Location Link'
  locationInput.classList.add('location-input')

  addressesContainer.appendChild(addressInput)
  addressesContainer.appendChild(locationInput)
}

// Add customer
customerForm.onsubmit = async (e) => {
  e.preventDefault()

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()
  if (userError || !user) {
    alert('Please log in first.')
    window.location.href = '/login.html'
    return
  }

  const full_name = nameInput.value.trim()
  const email = emailInput.value.trim() || null

  const phoneInputs = [...document.querySelectorAll('.phone-input')]
  const phones = phoneInputs.map(i => i.value.trim()).filter(v => v !== '')
  if (phones.length === 0) {
    alert('At least one phone is required.')
    return
  }

  const addressInputs = [...document.querySelectorAll('.address-input')]
  const locationInputs = [...document.querySelectorAll('.location-input')]
  let addresses = []
  for (let i = 0; i < addressInputs.length; i++) {
    const addr = addressInputs[i].value.trim()
    const loc = locationInputs[i]?.value.trim() || null
    if (addr !== '') {
      addresses.push({ address: addr, location: loc })
    }
  }

  const notes = notesInput.value.trim() || null

  try {
    const { data: customer, error: custError } = await supabase
      .from('customers')
      .insert({
        full_name,
        email,
        created_by: user.id,
        modified_by: user.id,
      })
      .select()
      .single()
    if (custError) throw custError

    for (const phone of phones) {
      const { error } = await supabase
        .from('phones')
        .insert({
          customer_id: customer.id,
          phone,
          created_by: user.id,
          modified_by: user.id,
        })
      if (error) throw error
    }

    for (const addr of addresses) {
      const { error } = await supabase
        .from('addresses')
        .insert({
          customer_id: customer.id,
          address: addr.address,
          location: addr.location,
          created_by: user.id,
          modified_by: user.id,
        })
      if (error) throw error
    }

    alert('Customer added successfully!')

    customerForm.reset()
    while (phonesContainer.children.length > 1) phonesContainer.removeChild(phonesContainer.lastChild)
    while (addressesContainer.children.length > 2) addressesContainer.removeChild(addressesContainer.lastChild)

    loadCustomers()
  } catch (error) {
    alert('Error adding customer: ' + error.message)
  }
}

// Search and sort handlers
searchInput.oninput = () => {
  lastSearch = searchInput.value.trim()
  currentPage = 0
  loadCustomers()
}
sortBySelect.onchange = () => {
  lastSortBy = sortBySelect.value
  currentPage = 0
  loadCustomers()
}
sortDirSelect.onchange = () => {
  lastSortDir = sortDirSelect.value
  currentPage = 0
  loadCustomers()
}
prevPageBtn.onclick = () => {
  if (currentPage > 0) {
    currentPage--
    loadCustomers()
  }
}
nextPageBtn.onclick = () => {
  if ((currentPage + 1) * pageSize < totalCustomers) {
    currentPage++
    loadCustomers()
  }
}

// Load customers list
async function loadCustomers() {
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()
  if (userError || !user) {
    window.location.href = '/login.html'
    return
  }

  customerList.innerHTML = 'Loading...'

  let query = supabase
    .from('customers')
    .select(`
      *,
      phones (
        id,
        phone,
        label
      ),
      addresses (
        id,
        address,
        location
      )
    `, { count: 'exact' })

  if (lastSearch) {
    query = query.or(`full_name.ilike.%${lastSearch}%,email.ilike.%${lastSearch}%`)
  }

  query = query.order(lastSortBy, { ascending: lastSortDir === 'asc' })

  const from = currentPage * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) {
    customerList.innerHTML = 'Error loading customers: ' + error.message
    return
  }

  totalCustomers = count || 0

  if (!data || data.length === 0) {
    customerList.innerHTML = '<li>No customers found.</li>'
    pageInfo.textContent = `Page ${currentPage + 1} of 1`
    return
  }

  pageInfo.textContent = `Page ${currentPage + 1} of ${Math.ceil(totalCustomers / pageSize)}`

  customerList.innerHTML = ''
  for (const cust of data) {
    const li = document.createElement('li')
    li.innerHTML = `
      <strong>${cust.full_name}</strong> <br/>
      ${cust.email ? `Email: ${cust.email}<br/>` : ''}
      Phones:<br/>
      <ul>
        ${cust.phones.map(p => `<li>${p.phone} ${p.label ? '(' + p.label + ')' : ''}</li>`).join('')}
      </ul>
      Addresses:<br/>
      <ul>
        ${cust.addresses.map(a => `<li>${a.address}${a.location ? ` (<a href="${a.location}" target="_blank">Location</a>)` : ''}</li>`).join('')}
      </ul>
      <button data-id="${cust.id}" class="edit-btn">Edit</button>
      <button data-id="${cust.id}" class="delete-btn">Delete</button>
    `
    customerList.appendChild(li)
  }

  // Delete buttons
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.onclick = async () => {
      const customerId = btn.getAttribute('data-id')
      if (!confirm('Are you sure you want to delete this customer and all related data?')) return

      let { error } = await supabase.from('phones').delete().eq('customer_id', customerId)
      if (error) {
        alert('Failed to delete phones: ' + error.message)
        return
      }

      ({ error } = await supabase.from('addresses').delete().eq('customer_id', customerId))
      if (error) {
        alert('Failed to delete addresses: ' + error.message)
        return
      }

      ({ error } = await supabase.from('customers').delete().eq('id', customerId))
      if (error) {
        alert('Failed to delete customer: ' + error.message)
        return
      }

      alert('Customer deleted successfully!')
      loadCustomers()
    }
  })

  // Edit buttons
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.onclick = async () => {
      const customerId = btn.getAttribute('data-id')
      const { data, error } = await supabase
        .from('customers')
        .select(`*, phones(id, phone), addresses(id, address, location)`)
        .eq('id', customerId)
        .single()

      if (error) {
        alert('Failed to load customer: ' + error.message)
        return
      }

      editNameInput.value = data.full_name
      editEmailInput.value = data.email || ''
      editNotesInput.value = data.notes || ''

      editPhonesContainer.innerHTML = ''
      for (const phone of data.phones) {
        const input = document.createElement('input')
        input.type = 'text'
        input.value = phone.phone
        input.classList.add('phone-input')
        input.dataset.phoneId = phone.id
        editPhonesContainer.appendChild(input)
      }

      editAddressesContainer.innerHTML = ''
      for (const addr of data.addresses) {
        const addrInput = document.createElement('input')
        addrInput.type = 'text'
        addrInput.value = addr.address
        addrInput.classList.add('address-input')
        addrInput.dataset.addressId = addr.id

        const locInput = document.createElement('input')
        locInput.type = 'text'
        locInput.value = addr.location || ''
        locInput.classList.add('location-input')

        editAddressesContainer.appendChild(addrInput)
        editAddressesContainer.appendChild(locInput)
      }

      editForm.dataset.customerId = customerId
      editModal.style.display = 'block'
    }
  })
}

// Edit modal add phone
editAddPhoneBtn.onclick = () => {
  const input = document.createElement('input')
  input.type = 'text'
  input.placeholder = 'Phone'
  input.classList.add('phone-input')
  editPhonesContainer.appendChild(input)
}

// Edit modal add address
editAddAddressBtn.onclick = () => {
  const addressInput = document.createElement('input')
  addressInput.type = 'text'
  addressInput.placeholder = 'Address'
  addressInput.classList.add('address-input')

  const locationInput = document.createElement('input')
  locationInput.type = 'text'
  locationInput.placeholder = 'Location Link'
  locationInput.classList.add('location-input')

  editAddressesContainer.appendChild(addressInput)
  editAddressesContainer.appendChild(locationInput)
}

// Edit modal cancel button
editCancelBtn.onclick = () => {
  editModal.style.display = 'none'
}

// Edit modal submit
editForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  const customerId = editForm.dataset.customerId
  const full_name = editNameInput.value.trim()
  const email = editEmailInput.value.trim()
  const notes = editNotesInput.value.trim()

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()
  if (userError || !user) {
    alert('You must be logged in to edit.')
    return
  }

  const { error: custError } = await supabase
    .from('customers')
    .update({ full_name, email, modified_by: user.id })
    .eq('id', customerId)

  if (custError) {
    alert('Error updating customer: ' + custError.message)
    return
  }

  const phoneInputs = [...editPhonesContainer.querySelectorAll('.phone-input')]
  for (const input of phoneInputs) {
    const phoneId = input.dataset.phoneId
    const phone = input.value.trim()
    if (phoneId) {
      await supabase.from('phones').update({ phone, modified_by: user.id }).eq('id', phoneId)
    }
  }

  const addrInputs = [...editAddressesContainer.querySelectorAll('.address-input')]
  const locInputs = [...editAddressesContainer.querySelectorAll('.location-input')]
  for (let i = 0; i < addrInputs.length; i++) {
    const id = addrInputs[i].dataset.addressId
    const address = addrInputs[i].value.trim()
    const location = locInputs[i].value.trim()
    if (id) {
      await supabase.from('addresses').update({ address, location, modified_by: user.id }).eq('id', id)
    }
  }

  alert('Customer updated successfully!')
  editModal.style.display = 'none'
  loadCustomers()
})

// Load initial customers list
loadCustomers()
