/* Shishir Portfolio — app.js (jQuery) */
(function($){
  const STORAGE_KEY = "portfolio_theme_v1";

  function setTheme(theme){
    if(theme === "light"){
      $("body").removeClass("theme-dark").addClass("theme-light");
      $("#themeToggle i").removeClass("bi-moon-stars").addClass("bi-sun");
    }else{
      $("body").removeClass("theme-light").addClass("theme-dark");
      $("#themeToggle i").removeClass("bi-sun").addClass("bi-moon-stars");
    }
    localStorage.setItem(STORAGE_KEY, theme);
  }

  function initTheme(){
    const saved = localStorage.getItem(STORAGE_KEY);
    if(saved){ setTheme(saved); return; }
    setTheme("dark");
  }

  function scrollProgress(){
    const docH = $(document).height() - $(window).height();
    const s = $(window).scrollTop();
    const p = docH > 0 ? (s / docH) * 100 : 0;
    $("#scrollProgress").css("width", p + "%");
  }

  function smoothAnchorNav(){
    $('a.nav-link[href^="#"], a.scroll-indicator[href^="#"]').on("click", function(e){
      const target = $(this).attr("href");
      if(!target || target.length < 2) return;

      const $el = $(target);
      if($el.length){
        e.preventDefault();

        const y = $el.offset().top - 78;
        window.scrollTo({ top: y, behavior: "smooth" });

        $(".navbar-collapse").collapse("hide");
      }
    });
  }

  function projectFiltering(){
    $(".project-filter").on("click", function(){
      const filter = $(this).data("filter");
      $(".project-filter").removeClass("active");
      $(this).addClass("active");

      $(".project-item").each(function(){
        const cat = $(this).data("category");
        if(filter === "all" || cat === filter){
          $(this).removeClass("d-none");
        }else{
          $(this).addClass("d-none");
        }
      });
    });
  }

  function skillFiltering(){
    $('[data-skill-filter]').on("click", function(){
      const filter = $(this).data("skill-filter");

      $(".skill-item").each(function(){
        const cat = $(this).data("skill");
        if(filter === "all" || cat === filter){
          $(this).removeClass("d-none");
        }else{
          $(this).addClass("d-none");
        }
      });
    });
  }

  function copyEmail(){
    $("#copyEmailBtn").on("click", async function(){
      const email = "shishirbhattarai033@gmail.com";
      try{
        await navigator.clipboard.writeText(email);
        $("#copyEmailBtn").text("Copied!");
        setTimeout(()=>$("#copyEmailBtn").html('<i class="bi bi-clipboard me-2"></i>Copy Email'), 1200);
      }catch(e){
        alert("Copy failed. Email: " + email);
      }
    });
  }

  function contactFormMailto(){
    $("#contactForm").on("submit", function(e){
      e.preventDefault();
      const data = Object.fromEntries(new FormData(this).entries());
      const subject = encodeURIComponent(data.subject || "Portfolio enquiry");
      const body = encodeURIComponent(
        `Name: ${data.name}\nEmail: ${data.email}\n\n${data.message}`
      );
      $("#formStatus").text("Opening your email app...");
      window.location.href = `mailto:shishirbhattarai033@gmail.com?subject=${subject}&body=${body}`;
      setTimeout(()=>$("#formStatus").text(""), 2500);
    });

    $("#fillDemoBtn").on("click", function(){
      $("input[name=name]").val("Hiring Manager");
      $("input[name=email]").val("manager@company.com");
      $("input[name=subject]").val("IT Support Technician role enquiry");
      $("textarea[name=message]").val(
        "Hi Shishir,\n\nI saw your portfolio and would like to discuss an IT Support / Service Desk role. Are you available this week for a quick chat?\n\nThanks,\n[Name]"
      );
    });
  }

  function setYear(){
    $("#year").text(new Date().getFullYear());
  }

  function initAOS(){
    if(window.AOS){
      AOS.init({ duration: 650, once: true, offset: 70 });
    }
  }

  function initScrollSpy(){
    // Make sure body has scrollspy attributes in HTML:
    // <body ... data-bs-spy="scroll" data-bs-target="#nav" data-bs-smooth-scroll="true" tabindex="0">
    if(window.bootstrap && bootstrap.ScrollSpy){
      bootstrap.ScrollSpy.getOrCreateInstance(document.body, {
        target: "#nav",
        offset: 120
      });
    }
  }

  $(function(){
    initTheme();
    setYear();
    smoothAnchorNav();
    projectFiltering();
    skillFiltering();
    copyEmail();
    contactFormMailto();
    initAOS();

    // Theme toggle
    $("#themeToggle").on("click", function(){
      const isLight = $("body").hasClass("theme-light");
      setTheme(isLight ? "dark" : "light");
    });

    // Scroll progress
    scrollProgress();
    $(window).on("scroll resize", scrollProgress);

    // ScrollSpy (active navbar link)
    initScrollSpy();

    // Set your GitHub URL here
    $("#githubLink").attr("href", "https://github.com/");
  });
})(jQuery);
