const compliments = [
    "انتظر قليلا يا قمر 💖",
    "انتظر قليلا يا حلو 💖",
    "انتظر قليلا يا سكر 💖",
    "انتظر قليلا يا عسل 💖",
    "انتظر قليلا يا جميل 💖"
];

document.addEventListener("DOMContentLoaded", () => {
    let t = document.querySelector(".splash-screen"),
        e = document.querySelector(".splash-message"),
        s = document.querySelector("#quiz-content");
    s && (s.style.display = "none"),
    e.textContent = compliments[Math.floor(Math.random() * compliments.length)],
    setTimeout(() => {
        t.style.opacity = "0",
        s && (s.style.display = "block"),
        setTimeout(() => t.remove(), 500)
    }, 5e3);

    // تشغيل صوت البدء تلقائيًا عند تحميل الصفحة
    const audioStart = new Audio("https://github.com/kijuhgty/audio/raw/refs/heads/main/start.mp3");
    audioStart.play().then(() => {
        console.log("تم تشغيل صوت البدء بنجاح");
    }).catch((error) => {
        console.error("تعذر تشغيل صوت البدء تلقائيًا:", error);
        // إذا فشل التشغيل التلقائي، يمكنك تفعيل الصوت بعد تفاعل المستخدم
        document.addEventListener("click", () => {
            audioStart.play().then(() => {
                console.log("تم تشغيل صوت البدء بعد تفاعل المستخدم");
            }).catch((error) => {
                console.error("تعذر تشغيل صوت البدء بعد تفاعل المستخدم:", error);
            });
        }, { once: true }); // التشغيل مرة واحدة فقط
    });
});

class Quiz {
    constructor() {
        this.currentQuestion = 0;
        this.score = 0;
        this.streak = 0;
        this.quizData = [];
        this.startScreen = document.getElementById("start-screen");
        this.quizScreen = document.getElementById("quiz-screen");
        this.resultsScreen = document.getElementById("results-screen");
        this.questionElement = document.querySelector(".question");
        this.optionsGrid = document.querySelector(".options-grid");
        this.nextButton = document.querySelector(".next-btn");
        this.progressBar = document.querySelector(".progress-bar");
        this.feedbackContainer = document.getElementById("feedback-container");
        this.streakCounter = document.getElementById("streak-counter");

        // تعريف عناصر الصوت مع تعليقات توضيحية
        this.audioCorrect = new Audio("https://github.com/kijuhgty/audio/raw/refs/heads/main/true.mp3"); // صوت الإجابة الصحيحة
        this.audioWrong = new Audio("https://github.com/kijuhgty/audio/raw/refs/heads/main/false.mp3"); // صوت الإجابة الخاطئة
        this.audioResults = new Audio("https://github.com/kijuhgty/audio/raw/refs/heads/main/end.mp3"); // صوت عرض النتيجة

        // تفعيل الصوت عند الضغط على زر "ابدأ"
        document.getElementById("start-btn").addEventListener("click", () => {
            this.startQuiz();
        });

        this.nextButton.addEventListener("click", () => this.nextQuestion());
        this.loadQuestions();
    }

    async loadQuestions() {
        try {
            let t = await (await fetch("https://raw.githubusercontent.com/dalatienglish/quiz-questions/refs/heads/main/Medium/Medium-3.json")).json();
            this.quizData = this.shuffleArray(t).slice(0, 10);
            console.log("تم تحميل الأسئلة بنجاح:", this.quizData); // تحقق من تحميل الأسئلة
        } catch (e) {
            console.error("Error loading questions:", e);
        }
    }

    shuffleArray(t) {
        for (let e = t.length - 1; e > 0; e--) {
            let s = Math.floor(Math.random() * (e + 1));
            [t[e], t[s]] = [t[s], t[e]];
        }
        return t;
    }

    startQuiz() {
        if (0 === this.quizData.length) {
            alert("يرجى الانتظار حتى يتم تحميل الأسئلة");
            return;
        }
        this.startScreen.style.display = "none";
        this.quizScreen.style.display = "block";
        this.currentQuestion = 0;
        this.score = 0;
        this.streak = 0;
        this.showQuestion();
        this.updateProgressBar();
        this.updateStreakCounter();
    }

    showQuestion() {
        let t = this.quizData[this.currentQuestion];
        this.questionElement.textContent = t.question;
        this.optionsGrid.innerHTML = "";
        this.feedbackContainer.style.display = "none";
        t.options.forEach(t => {
            let e = document.createElement("button");
            e.className = "option-btn fade-in";
            e.textContent = t;
            e.addEventListener("click", () => this.checkAnswer(t));
            this.optionsGrid.appendChild(e);
        });
        this.nextButton.style.display = "none";
    }

    updateStreakCounter() {
        this.streak > 0 ? (this.streakCounter.textContent = `سلسلة الإجابات الصحيحة: ${this.streak}`, this.streakCounter.style.display = "block") : this.streakCounter.style.display = "none";
    }

    showFeedback(t) {
        let e = this.quizData[this.currentQuestion],
            s = this.feedbackContainer,
            n = s.querySelector(".feedback-text"),
            i = s.querySelector(".fact-box");
        n.style.display = "none";
        i.textContent = `معلومة: ${e.fact}`;
        s.style.display = "block";
    }

    checkAnswer(t) {
        let e = this.quizData[this.currentQuestion].correct;
        this.optionsGrid.querySelectorAll(".option-btn").forEach(s => {
            s.disabled = !0,
            s.textContent === e ? s.classList.add("correct") : s.textContent === t && s.classList.add("wrong")
        });

        if (t === e) {
            this.score++;
            this.streak++;
            this.audioCorrect.play().catch((error) => {
                console.error("تعذر تشغيل الصوت الصحيح:", error);
            }); // تشغيل صوت الإجابة الصحيحة
            this.showFeedback(!0);
        } else {
            this.streak = 0;
            this.audioWrong.play().catch((error) => {
                console.error("تعذر تشغيل الصوت الخاطئ:", error);
            }); // تشغيل صوت الإجابة الخاطئة
            this.showFeedback(!1);
        }

        this.updateStreakCounter();
        this.nextButton.style.display = "block";
    }

    nextQuestion() {
        this.currentQuestion++;
        this.updateProgressBar();
        this.currentQuestion < this.quizData.length ? this.showQuestion() : this.showResults();
    }

    updateProgressBar() {
        this.progressBar.style.width = `${this.currentQuestion / this.quizData.length * 100}%`;
    }

    showResults() {
        this.quizScreen.style.display = "none";
        this.resultsScreen.style.display = "block";
        document.getElementById("score").textContent = this.score;
        document.getElementById("total").textContent = this.quizData.length;
        document.querySelector(".score-details").style.display = "none";

        // تشغيل صوت النتيجة
        this.audioResults.play().catch((error) => {
            console.error("تعذر تشغيل صوت النتيجة:", error);
        });
    }
}

new Quiz();