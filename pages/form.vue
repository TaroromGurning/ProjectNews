<script setup>
const API_URL = 'https://jsonplaceholder.typicode.com/users'

const users = ref([])
const isLoading = ref(false)
const isEditing = ref(false)

const form = ref({
  id: null,
  name: '',
  phone: '',
  email: '',
  zipcode: '',
  message: ''
})

const fetchUsers = async () => {
  isLoading.value = true

  try {
    const response = await $fetch(API_URL)

    const result = response.slice(0, 10)

    users.value = result.map((item) => {
      return {
        id: item.id,
        name: item.name,
        email: item.email,
        phone: item.phone.replace(/\D/g, '').slice(0, 13),
        zipcode: item.address?.zipcode || '',
        message: item.company?.catchPhrase || ''
      }
    })
  } catch (error) {
    alert('Data gagal diambil')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchUsers()
})

const handleSubmit = async () => {
  isLoading.value = true

  try {
    if (isEditing.value === true) {
        const { id, ...payload } = form.value;
      await $fetch(API_URL + '/' + form.value.id, {
        method: 'PUT',
        body: payload
      })

      const index = users.value.findIndex((item) => item.id === form.value.id)

      if (index !== -1) {
        users.value[index] = {
          ...form.value
        }
      }
    } else {
      const response = await $fetch(API_URL, {
        method: 'POST',
        body: form.value
      })

      users.value.unshift({
        ...form.value,
        id: response.id || Date.now()
      })
    }

    resetForm()
  } catch (error) {
    alert('Terjadi kesalahan saat menyimpan data')
  } finally {
    isLoading.value = false
  }
}

const deleteUser = async (id) => {
  const yakin = confirm('Yakin ingin menghapus data ini?')

  if (!yakin) {
    return
  }

  isLoading.value = true

  try {
    await $fetch(API_URL + '/' + id, {
      method: 'DELETE'
    })

    users.value = users.value.filter((item) => item.id !== id)
  } catch (error) {
    alert('Data gagal dihapus')
  } finally {
    isLoading.value = false
  }
}

const validatePhone = (event) => {
  const input = event.target.value
  form.value.phone = input.replace(/\D/g, '').slice(0, 13)
}

const setEdit = (user) => {
  isEditing.value = true

  form.value.id = user.id
  form.value.name = user.name
  form.value.phone = user.phone
  form.value.email = user.email
  form.value.zipcode = user.zipcode
  form.value.message = user.message

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

const resetForm = () => {
  isEditing.value = false

  form.value.id = null
  form.value.name = ''
  form.value.phone = ''
  form.value.email = ''
  form.value.zipcode = ''
  form.value.message = ''
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
    <div class="container mx-auto space-y-8">
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div :class="isEditing ? 'bg-amber-50 border-amber-200' : 'bg-indigo-50 border-indigo-200'" class="px-6 py-4 border-b">
          <h3 class="text-lg font-bold">
            <span v-if="isEditing"> Edit Pengguna # {{ form.id }}</span>
            <span v-else> Tambah Pengguna Baru</span>
          </h3>
        </div>

        <form @submit.prevent="handleSubmit" class="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div class="space-y-1">
            <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama Lengkap</label>
            <input v-model="form.name" type="text" required placeholder="Nama Anda" 
              class="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg ring-none focus:bg-white outline-none transition-all" />
          </div>

          <div class="space-y-1">
            <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">No. WhatsApp</label>
            <input v-model="form.phone" @input="validatePhone" type="text" required placeholder="No WhatsApp Anda"
              class="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg ring-none focus:bg-white outline-none transition-all" />
          </div>

          <div class="space-y-1">
            <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Alamat Email</label>
            <input v-model="form.email" type="email" required placeholder="Email Anda"
              class="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg ring-none focus:bg-white outline-none transition-all" />
          </div>

          <div class="space-y-1">
            <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Kode Pos</label>
            <input v-model="form.zipcode" type="text" required placeholder="Kode Pos Anda"
              class="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg ring-none focus:bg-white outline-none transition-all" />
          </div>

          <div class="md:col-span-2 space-y-1">
            <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Catatan Tambahan</label>
            <textarea v-model="form.message" rows="5" placeholder="Tulis catatan di sini..."
              class="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg outline-none transition-all ring-none focus:bg-white"></textarea>
          </div>

          <div class="md:col-span-2 pt-2 flex items-center gap-3">
            <button 
              type="submit" 
              :disabled="isLoading"
              class="flex-1 inline-flex justify-center items-center px-8 py-3 border border-transparent text-base font-medium rounded-xl bg-blue-200 text-black shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
              :class="isEditing ? 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500' : 'bg-indigo-500 hover:bg-indigo-700 focus:ring-indigo-500'"
            >
              <svg v-if="isLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-black" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isLoading ? 'Memproses...' : (isEditing ? 'Simpan Perubahan' : 'Daftar') }}
            </button>
            
            <button v-if="isEditing" type="button" @click="resetForm" 
              class="px-8 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all">
              Batal
            </button>
          </div>
        </form>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200">
                <th class="px-10 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">User Info</th>
                <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Kontak & kodepos</th>
                <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-center">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="user in users" :key="user.id" class="hover:bg-indigo-50/30 transition-colors group">
                <td class="px-6 py-4">
                  <div class="flex items-center">
                    <div class="ml-4">
                      <div class="text-sm font-bold text-gray-900">{{ user.name }}</div>
                      <div class="text-xs text-gray-500">{{ user.email }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                    <div class="text-sm text-gray-700 font-medium">{{ user.phone }}</div>
                    <div class="text-xs text-gray-500">{{ user.zipcode }}</div>
                </td>
                <td class="px-6 py-4 text-center">
                  <div class="flex justify-center gap-2">
                    <button @click="setEdit(user)" 
                      class="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors" title="Edit Data">
                      <span class="text-sm font-bold">Edit</span>
                    </button>
                    <button @click="deleteUser(user.id)" 
                      class="p-2 text-rose-500 hover:bg-rose-100 rounded-lg transition-colors" title="Hapus Data">
                      <span class="text-sm font-bold">Hapus</span>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="users.length === 0 && !isLoading">
                <td colspan="3" class="px-6 py-12 text-center text-gray-400">Belum ada data tersedia</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
button, input, textarea {
  transition: all 0.2s ease-in-out;
}
</style>