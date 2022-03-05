import 'vue'

declare module 'vue/types/vue' {
  interface Vue {
    $formulate: FormulateGlobalInstance;
  }
}
