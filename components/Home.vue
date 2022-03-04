<script lang="ts">
export default {
  data() {
    return {
      formValues: {}
    }
  }
}
</script>

<template>
<div>
  <FormulateForm
    v-model="formValues"
  >
    <FormulateInput
      name="name"
      label="What is your name?"
      validation="required"
    />
    <FormulateInput
      name="age"
      label="How old are you?"
      validation="required|number|max:120"
    />
    <FormulateInput
      type="submit"
      label="Sign up"
    />
  </FormulateForm>
  <pre>{{ formValues }}</pre>
</div>
</template>
