<script lang="ts">
import Vue from 'vue';
import form from '../config/form.json';

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

type Data = {
  formValues: Record<string, any>;
  questions: Array<Record<string, any>>;
  index: number;
  countdown: number | null;
  penaltyCounts: Record<string, any>;
  beginTime: number | null;
  penaltyTime: number | null;
  penaltyDisplay: number | null;
};

export default Vue.extend({
  data(): Data {
    return {
      formValues: {},
      questions: form.questions,
      index: 0,
      countdown: null,
      penaltyCounts: {},
      beginTime: null,
      penaltyTime: null,
      penaltyDisplay: null,
    };
  },
  computed: {
    question(): Record<string, any> {
      return this.questions[this.index];
    },
    timerActive(): boolean {
      return this.penaltyDisplay ? this.penaltyDisplay > 0 : false;
    },
    countdownActive(): boolean {
      return this.countdown ? this.countdown > 0 : false;
    },
  },
  mounted() {
    this.$nextTick(function () {
      const lsTime = localStorage.getItem('beginTime');
      if (typeof lsTime === 'number') {
        this.beginTime = lsTime;
        this.beginGlobalCountdown();
      }
    });
  },
  methods: {
    beginCountDown(): void {
      const start = this.penaltyTime ?? 0;
      this.penaltyDisplay = start - Date.now();

      clearInterval(timerInterval);
      timerInterval = setInterval(() => {
        this.penaltyDisplay = start - Date.now();
        if (this.penaltyDisplay <= 0) clearInterval(timerInterval);
      }, 1000);
    },
    beginGlobalCountdown(): void {
      const start = this.beginTime ?? 0;
      this.countdown = start - Date.now();

      clearInterval(globalInterval);
      globalInterval = setInterval(() => {
        this.countdown = start - Date.now();
        if (this.countdown <= 0) clearInterval(globalInterval);
      }, 1000);
    },
    begin(): void {
      const time = Date.now() + 3_600_000;
      localStorage.setItem('beginTime', String(time));
      this.beginTime = time;
      this.beginGlobalCountdown();
    },
    handleSubmit() {
      console.log();
    },
    onPrevious(): void {
      this.index = Math.max(0, this.index - 1);
    },
    onNext(): void {
      this.index = Math.min(this.index + 1, this.questions.length - 1);
      this.penaltyTime = 0; // let's store in local storage refreshing etc. doesn't change much
    },
    handleNext(hasErrors: Boolean): void {
      if (!hasErrors) {
        this.$bvModal.show('modal');
      } else {
        // get our penalties in local storage - this will have the penalty count for each question by name
        // add 1 to the penalty count
        // persist the current time the penalty happened in local storage
        this.penaltyCounts[this.question.name] =
          (this.penaltyCounts[this.question.name] ?? 0) + 1;
        this.penaltyTime =
          Date.now() + this.penaltyCounts[this.question.name] * 10000;
        this.beginCountDown();
      }
    },
  },
});
</script>

<template>
  <div>
    <p>
      {{
        `${new Date(countdown).getMinutes()}:${new Date(
          countdown
        ).getSeconds()}`
      }}
    </p>
    <button @click="begin">Begin</button>
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
        :disabled="timerActive"
        error-behavior="submit"
      />
      <div>
        <button type="button" @click="onPrevious">Previous</button>
        <button
          :disabled="timerActive"
          type="button"
          @click="handleNext(hasErrors)"
        >
          Next
        </button>
      </div>
    </FormulateForm>
    <b-modal
      id="modal"
      title="You uncovered a clue"
      :ok-only="true"
      @ok="onNext"
    >
      <h3>New Discovery: {{ question.clue }}</h3>
      <h4>Your answer: {{ formValues[question.name] }}</h4>
    </b-modal>
    <p v-if="timerActive">
      {{
        `${new Date(penaltyDisplay).getMinutes()}:${new Date(
          penaltyDisplay
        ).getSeconds()}`
      }}
    </p>
    <pre>{{ formValues }}</pre>
    <p>{{ index }}</p>
  </div>
</template>
