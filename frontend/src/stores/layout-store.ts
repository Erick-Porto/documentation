import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLayoutStore = defineStore('layout', () => {
  const leftDrawerOpen = ref(true)

  function toggleLeftDrawer() {
    leftDrawerOpen.value = !leftDrawerOpen.value
  }

  function setLeftDrawer(state: boolean) {
    leftDrawerOpen.value = state
  }

  return { leftDrawerOpen, toggleLeftDrawer, setLeftDrawer }
})