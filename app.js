/* ==========================================================================
   [ТЕМА: Об'єктна модель документа (DOM). Веб-програмування та інтерактивні сторінки]
   Увесь код загорнуто в самовикликану функцію (IIFE), щоб наші змінні
   не конфліктували з іншими скриптами на сторінці.
   ========================================================================== */
(function () {
  "use strict";

  // [ТЕМА: Безпека веб-сторінок] Функція escapeHtml замінює небезпечні символи (<, >, ")
  // на безпечні HTML-сутності, щоб ніхто не зміг вставити чужий код через форму (XSS-захист).
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  /* --------------------------------------------------------------------------
     1. ДАНІ ГАЛЕРЕЇ (МАСИВ ОБ'ЄКТІВ)
     --------------------------------------------------------------------------
     Кожен об'єкт відповідає одній картці в HTML (data-index="0", "1", "2"...).
     СПРОБУЙ ЗМІНИТИ: відредагуй текст у summary або tags, чи додай ще один об'єкт у кінець масиву. */
  var PROJECTS = [
    {
      src: "./assets/cars/viper-neon-gt3.jpg",
      alt: "SRT Viper GT3-R з бірюзово-рожевою неоновою лівреєю та заднім антикрилом",
      title: "SRT Viper GT3-R",
      serviceValue: "neon",
      styleLabel: "SRT Viper GT3-R — неонова ліврея та LED-контур",
      tags: ["Неонова ліврея", "Сплітер та антикрило", "9 днів"],
      summary: "Повна кастомна графіка з люмінесцентними акцентами, монтаж трекового карбонового антикрила та налаштування Bi-LED фар."
    },
    {
      src: "./assets/cars/shelby-gt500-blue.jpg",
      alt: "Shelby GT500 Cobra у темно-синьому глянці з білими смугами та блакитною підсвіткою коліс",
      title: "Shelby GT500 Cobra",
      serviceValue: "vinyl",
      styleLabel: "Shelby GT500 — синій глянець, смуги й підсвітка арок",
      tags: ["Вініл кобальт", "Гоночні смуги", "7 днів"],
      summary: "Обклеювання кузова темно-синьою плівкою, нанесення контрастних білих смуг без стиків та монтаж блакитної підсвітки колісних арок."
    },
    {
      src: "./assets/cars/camaro-fire-red.jpg",
      alt: "Chevrolet Camaro SS у глибокому червоному кольорі з карбоновим капотом та ДХВ-кільцями",
      title: "Chevrolet Camaro SS",
      serviceValue: "aero",
      styleLabel: "Chevrolet Camaro SS — карбоновий капот і ДХВ-кільця",
      tags: ["Карбоновий капот", "ДХВ-оптика", "6 днів"],
      summary: "Встановлення вентильованого капоту з контрастною чорною смугою, доопрацювання передніх фар діодними кільцями та бронеплівка."
    },
    {
      src: "./assets/cars/concept-rdstr-front.jpg",
      alt: "Білий футуристичний спорткар RDSTR з підйомними дверима та суцільною світлодіодною смугою",
      title: "RDSTR Concept",
      serviceValue: "full",
      styleLabel: "RDSTR Concept — білий сатин і суцільна LED-смуга",
      tags: ["Перламутровий сатин", "LED-смуга", "12 днів"],
      summary: "Повне перефарбування у холодний перламутровий сатин, інтеграція суцільної передньої світлодіодної стрічки та антихром."
    },
    {
      src: "./assets/cars/bugatti-ice-fire.jpg",
      alt: "Bugatti Veyron у біло-сріблястому сатині з синьою оптикою та глянцевою керамікою",
      title: "Bugatti Veyron",
      serviceValue: "protect",
      styleLabel: "Bugatti Veyron — багатошарова кераміка та синій LED",
      tags: ["Кераміка 3 шари", "Полірування", "5 днів"],
      summary: "Відновлювальне полірування кузова, нанесення тришарової захисної кераміки та адаптація холодного синього підсвічування оптики."
    },
    {
      src: "./assets/cars/mustang-cobalt-gt.jpg",
      alt: "Ford Mustang GT у кольорі кобальт-синій зі сріблястими смугами та холодним ксеноном",
      title: "Ford Mustang GT",
      serviceValue: "vinyl",
      styleLabel: "Ford Mustang GT — електрик-синій металік і смуги",
      tags: ["Металік-плівка", "Bi-LED оптика", "8 днів"],
      summary: "Обтяжка у насичений кобальт-синій металік зі сріблястими смугами, заміна протитуманних модулів і захист бампера поліуретаном."
    }
  ];

  /* --------------------------------------------------------------------------
     2. МОБІЛЬНЕ МЕНЮ (ПОШУК ЕЛЕМЕНТІВ В DOM ТА ПОДІЯ CLICK)
     -------------------------------------------------------------------------- */
  var menuToggle = document.getElementById("menu-toggle");
  var mobileNav = document.getElementById("mobile-nav");

  function setMobileNav(open) {
    if (!menuToggle || !mobileNav) return;
    menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
    mobileNav.hidden = !open;
  }

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener("click", function () {
      var isOpen = menuToggle.getAttribute("aria-expanded") === "true";
      setMobileNav(!isOpen);
    });

    // Закриваємо меню автоматично після кліку по будь-якому посиланню всередині
    mobileNav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        setMobileNav(false);
      }
    });
  }

  /* --------------------------------------------------------------------------
     3. ГАЛЕРЕЯ LIGHTBOX (КЕРУВАННЯ DOM-ВУЗЛАМИ ТА КЛАВІАТУРОЮ)
     -------------------------------------------------------------------------- */
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightbox-img");
  var lightboxTitle = document.getElementById("lightbox-title");
  var lightboxTags = document.getElementById("lightbox-tags");
  var lightboxDesc = document.getElementById("lightbox-desc");
  var lightboxCounter = document.getElementById("lightbox-counter");
  var lightboxClose = document.getElementById("lightbox-close");
  var lightboxPrev = document.getElementById("lightbox-prev");
  var lightboxNext = document.getElementById("lightbox-next");
  var lightboxWantBtn = document.getElementById("lightbox-want-btn");
  var galleryGrid = document.getElementById("gallery-grid");

  var activeIndex = 0;
  var lastFocusedEl = null;

  // Оновлює картинку, заголовок, теги та лічильник "1 / 6" всередині модального вікна
  function renderLightbox(index) {
    var item = PROJECTS[index];
    if (!item) return;
    activeIndex = index;

    lightboxImg.src = item.src;
    lightboxImg.alt = item.alt;
    lightboxTitle.textContent = item.title;
    lightboxDesc.textContent = item.summary;
    lightboxCounter.textContent = (index + 1) + " / " + PROJECTS.length;
    lightboxTags.innerHTML = item.tags
      .map(function (tag) {
        return '<span class="lightbox-tag-pill">' + escapeHtml(tag) + "</span>";
      })
      .join("");
  }

  function openLightbox(index) {
    if (!lightbox) return;
    lastFocusedEl = document.activeElement;
    renderLightbox(index);
    lightbox.hidden = false;
    document.body.classList.add("modal-open");
    if (lightboxClose) {
      lightboxClose.focus();
    }
  }

  function closeLightbox() {
    if (!lightbox || lightbox.hidden) return;
    lightbox.hidden = true;
    document.body.classList.remove("modal-open");
    if (lastFocusedEl && typeof lastFocusedEl.focus === "function") {
      lastFocusedEl.focus();
    }
  }

  // Формула циклічного перемикання: після останнього фото знову відкриється перше (і навпаки)
  function stepLightbox(delta) {
    var nextIndex = (activeIndex + delta + PROJECTS.length) % PROJECTS.length;
    renderLightbox(nextIndex);
  }

  // Делегування подій: слухаємо клік на всій сітці .gallery-grid, а не на кожній кнопці окремо
  if (galleryGrid) {
    galleryGrid.addEventListener("click", function (e) {
      var card = e.target.closest(".gallery-card");
      if (!card) return;
      var idx = parseInt(card.getAttribute("data-index"), 10);
      if (!isNaN(idx) && idx >= 0 && idx < PROJECTS.length) {
        openLightbox(idx);
      }
    });
  }

  if (lightbox) {
    lightbox.addEventListener("click", function (e) {
      if (e.target.getAttribute("data-close") === "true") {
        closeLightbox();
      }
    });
  }

  if (lightboxClose) {
    lightboxClose.addEventListener("click", closeLightbox);
  }
  if (lightboxPrev) {
    lightboxPrev.addEventListener("click", function () {
      stepLightbox(-1);
    });
  }
  if (lightboxNext) {
    lightboxNext.addEventListener("click", function () {
      stepLightbox(1);
    });
  }

  // Керування з клавіатури: Escape закриває, стрілки ліво/право гортають фото
  document.addEventListener("keydown", function (e) {
    if (lightbox && !lightbox.hidden) {
      if (e.key === "Escape") {
        closeLightbox();
      } else if (e.key === "ArrowLeft") {
        stepLightbox(-1);
      } else if (e.key === "ArrowRight") {
        stepLightbox(1);
      }
    } else if (e.key === "Escape" && mobileNav && !mobileNav.hidden) {
      setMobileNav(false);
    }
  });

  /* --------------------------------------------------------------------------
     4. ФОРМА ЗАПИСУ, ВАЛІДАЦІЯ ТА ПІДГОТОВКА ДАНИХ ДЛЯ СЕРВЕРА
     -------------------------------------------------------------------------- */
  var form = document.getElementById("booking-form");
  var nameInput = document.getElementById("name");
  var contactInput = document.getElementById("contact");
  var carInput = document.getElementById("car");
  var serviceSelect = document.getElementById("service");
  var referenceInput = document.getElementById("reference");
  var errorName = document.getElementById("error-name");
  var errorContact = document.getElementById("error-contact");
  var formStatus = document.getElementById("form-status");

  // Кнопка "Хочу схожий проєкт" у Lightbox автоматично заповнює поля форми нижче на сторінці
  if (lightboxWantBtn) {
    lightboxWantBtn.addEventListener("click", function () {
      var currentProject = PROJECTS[activeIndex];
      closeLightbox();

      if (currentProject && serviceSelect && referenceInput) {
        serviceSelect.value = currentProject.serviceValue;
        referenceInput.value = currentProject.styleLabel;
        referenceInput.classList.add("is-highlighted");
        window.setTimeout(function () {
          referenceInput.classList.remove("is-highlighted");
        }, 1800);
      }

      var bookingSection = document.getElementById("booking");
      if (bookingSection) {
        bookingSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      if (nameInput) {
        window.setTimeout(function () {
          nameInput.focus({ preventScroll: true });
        }, 300);
      }
    });
  }

  function clearErrors() {
    if (errorName) errorName.textContent = "";
    if (errorContact) errorContact.textContent = "";
    if (nameInput) nameInput.removeAttribute("aria-invalid");
    if (contactInput) contactInput.removeAttribute("aria-invalid");
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      // Зупиняємо стандартне перезавантаження сторінки, щоб обробити форму через JS
      e.preventDefault();
      clearErrors();

      var nameVal = nameInput ? nameInput.value.trim() : "";
      var contactVal = contactInput ? contactInput.value.trim() : "";
      var carVal = carInput ? carInput.value.trim() : "";
      var serviceVal = serviceSelect ? serviceSelect.value : "full";
      var referenceVal = referenceInput ? referenceInput.value.trim() : "";
      var hasError = false;

      if (nameVal.length < 2) {
        if (errorName) errorName.textContent = "Вкажіть ім'я (мінімум 2 символи).";
        if (nameInput) nameInput.setAttribute("aria-invalid", "true");
        hasError = true;
      }

      if (contactVal.length < 4) {
        if (errorContact) errorContact.textContent = "Вкажіть номер або нік у Telegram.";
        if (contactInput) contactInput.setAttribute("aria-invalid", "true");
        hasError = true;
      }

      if (hasError) {
        if (formStatus) formStatus.hidden = true;
        return;
      }

      /* ========================================================================
         [ТЕМА: Веб-сервер і база даних. Взаємодія клієнт-сервер]
         1. Клієнт (цей браузер) пакує введені поля в єдиний об'єкт (JSON-запит).
         2. На статичному хостингу (GitHub Pages) немає власної бази даних, тому ми
            демонструємо цей пакет у консолі розробника (F12 -> вкладка Console).
         3. Коли з'явиться веб-сервер (наприклад, Node.js, Python або PHP), ми
            надішлемо цей самий JSON методом HTTP POST на сервер, а сервер збереже
            запис у таблицю бази даних (INSERT INTO bookings ...).
         ======================================================================== */
      var bookingPayload = {
        name: nameVal,
        contact: contactVal,
        car: carVal || "Не вказано",
        service: serviceVal,
        reference: referenceVal || "Без референсу",
        createdAt: new Date().toISOString()
      };

      console.log(
        "📤 [КЛІЄНТ → СЕРВЕР] Дані заявки, готові до відправки в базу даних:\n" +
        JSON.stringify(bookingPayload, null, 2)
      );

      /* Приклад реального запиту на сервер (розкоментують, коли підключать бекенд):
      fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingPayload)
      });
      */

      var serviceText = serviceSelect && serviceSelect.selectedOptions[0]
        ? serviceSelect.selectedOptions[0].textContent
        : "Обраний напрямок";

      if (formStatus) {
        formStatus.innerHTML =
          "Дякуємо, <strong>" + escapeHtml(nameVal) + "</strong>! Заявку на «" +
          escapeHtml(serviceText) + "» зафіксовано. Ми зв'яжемось за контактом " +
          escapeHtml(contactVal) + ".";
        formStatus.hidden = false;
      }

      form.reset();
    });
  }
})();
