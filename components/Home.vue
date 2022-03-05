<script lang="ts">
import form from '../config/form.json'

// form question
/*
    {
      "title": "Test 2",
      "url": "https://picsum.photos/200/300",
      "description": "This is the 2nd question description",
      "answer": "28",
      "clue": "K"
    }
*/
let timerInterval;
let globalInterval;

export default {
  data() {
    return {
      formValues: {},
      allValues: {},
      questions: form.questions,
      index: 0,
      countdown: null,
      penaltyCounts: {},
      beginTime: null,
      penaltyTime: null,
      penaltyDisplay: null,
    }
  },
  computed: {
    question() {
      return this.questions[this.index]
    },
    timerActive() {
      return this.penaltyDisplay > 0;
    },
    countdownActive() {
      return this.countdown > 0;
    }
  },
  mounted () {
    this.$nextTick(function () {
      this.beginTime = localStorage.getItem('beginTime');
      if (this.beginTime) {
        this.beginGlobalCountdown()
      }
    })
  },
  methods: {
    beginCountDown() {
      this.penaltyDisplay = this.penaltyTime - Date.now();

      clearInterval(timerInterval);
      timerInterval = setInterval(() => {
           this.penaltyDisplay = this.penaltyTime - Date.now();
          if (this.penaltyDisplay <= 0) clearInterval(timerInterval);
      }, 1000)
    },
    beginGlobalCountdown() {
      this.countdown = this.beginTime - Date.now();

      clearInterval(globalInterval);
      globalInterval = setInterval(() => {
           this.countdown = this.beginTime - Date.now();
          if (this.countdown <= 0) clearInterval(globalInterval);
      }, 1000)
    },
    begin() {
      const time = Date.now() + 3_600_000;
      localStorage.setItem('beginTime', time)
      this.beginTime = time;
      this.beginGlobalCountdown();
    },
    handleSubmit() {
      console.log()
    },
    onPrevious() {
      this.index = Math.max(0, this.index - 1)
    },
    onNext() {
        this.index = Math.min(this.index + 1, this.questions.length - 1);
        this.penaltyTime = 0; // let's store in local storage refreshing etc. doesn't change much
    },
    handleNext(hasErrors: Boolean) {
      if (!hasErrors) {
        this.$bvModal.show("modal");
      } else {
        // get our penalties in local storage - this will have the penalty count for each question by name
        // add 1 to the penalty count
        // persist the current time the penalty happened in local storage
        this.penaltyCounts[this.question.name] = (this.penaltyCounts[this.question.name] ?? 0) + 1;
        this.penaltyTime = Date.now() + (this.penaltyCounts[this.question.name] * 10000 );
        this.beginCountDown();
      }
    },
  },
}
</script>

<template>
  <div>
    <p>
      {{ `${new Date(countdown).getMinutes()}:${new Date(countdown).getSeconds()}` }}
    </p>
    <button @click='begin'>Begin</button>
    <h1>{{ question.title }}</h1>
    <img :src="question.url" alt="question image" />
    <p>{{ question.description }}</p>
    <FormulateForm
      v-slot="{ hasErrors }"
      v-model="formValues"
      :keep-model-data="true"
      @submit="handleSubmit"
    >
      <FormulateInput
        :key="question.name"
        :name="question.name"
        :validation="'bail|required|number|matches:' + question.answer"
        :disabled='timerActive'
        error-behavior="submit"
      />
          <div>
      <button type="button" @click="onPrevious">Previous</button>
      <button :disabled='timerActive' type="button" @click="handleNext(hasErrors)">Next</button>
    </div>
    </FormulateForm>
    <b-modal id="modal" title="You uncovered a clue" :ok-only="true" @ok="onNext">
        <h3>New Discovery: {{ question.clue }}</h3>
        <h4>Your answer: {{ formValues[question.name] }}</h4>
    </b-modal>
    <p v-if='timerActive'>{{ `${new Date(penaltyDisplay).getMinutes()}:${new Date(penaltyDisplay).getSeconds()}` }}</p>
    <pre>{{ formValues }}</pre>
    <p>{{ index }}</p>
  </div>
</template>
