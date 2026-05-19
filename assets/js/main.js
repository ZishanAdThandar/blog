/* =========================================================
   ZISHANHACK MAIN JS
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    /* =====================================================
       READING PROGRESS BAR
    ===================================================== */

    const progressBar =
      document.createElement("div");

    progressBar.id =
      "reading-progress";

    progressBar.style.position =
      "fixed";

    progressBar.style.top =
      "0";

    progressBar.style.left =
      "0";

    progressBar.style.height =
      "3px";

    progressBar.style.width =
      "0%";

    progressBar.style.zIndex =
      "99999";

    progressBar.style.background =
      "linear-gradient(90deg,#6366f1,#8b5cf6)";

    document.body.appendChild(
      progressBar
    );

    window.addEventListener(
      "scroll",
      () => {

        const scrollTop =
          document.documentElement
            .scrollTop;

        const scrollHeight =
          document.documentElement
            .scrollHeight
          -
          document.documentElement
            .clientHeight;

        const progress =
          (scrollTop / scrollHeight)
          * 100;

        progressBar.style.width =
          progress + "%";

      }
    );

    /* =====================================================
       HEADING ANCHORS
    ===================================================== */

    const headings =
      document.querySelectorAll(
        ".blog-content h2, .blog-content h3"
      );

    headings.forEach(
      heading => {

        if (!heading.id) {

          heading.id =
            heading.innerText
              .toLowerCase()
              .replace(/[^\w\s]/g, "")
              .replace(/\s+/g, "-");

        }

        const anchor =
          document.createElement("a");

        anchor.href =
          "#" + heading.id;

        anchor.className =
          "heading-anchor";

        anchor.innerHTML =
          '<i class="fas fa-link"></i>';

        anchor.style.marginLeft =
          "10px";

        anchor.style.opacity =
          "0";

        anchor.style.transition =
          "0.2s ease";

        heading.appendChild(anchor);

        heading.addEventListener(
          "mouseenter",
          () => {

            anchor.style.opacity =
              "1";

          }
        );

        heading.addEventListener(
          "mouseleave",
          () => {

            anchor.style.opacity =
              "0";

          }
        );

      }
    );

    /* =====================================================
       COPY BUTTONS
    ===================================================== */

    const codeBlocks =
      document.querySelectorAll(
        "pre"
      );

    codeBlocks.forEach(
      block => {

        const wrapper =
          document.createElement("div");

        wrapper.style.position =
          "relative";

        block.parentNode.insertBefore(
          wrapper,
          block
        );

        wrapper.appendChild(block);

        const button =
          document.createElement(
            "button"
          );

        button.className =
          "copy-button";

        button.innerHTML =
          '<i class="fas fa-copy"></i>';

        button.style.position =
          "absolute";

        button.style.top =
          "12px";

        button.style.right =
          "12px";

        button.style.background =
          "#1e293b";

        button.style.border =
          "1px solid rgba(255,255,255,0.08)";

        button.style.color =
          "#cbd5e1";

        button.style.padding =
          "8px 10px";

        button.style.borderRadius =
          "8px";

        button.style.cursor =
          "pointer";

        button.style.transition =
          "0.2s ease";

        wrapper.appendChild(
          button
        );

        button.addEventListener(
          "click",
          async () => {

            const code =
              block.innerText;

            try {

              await navigator
                .clipboard
                .writeText(code);

              button.innerHTML =
                '<i class="fas fa-check"></i>';

              setTimeout(
                () => {

                  button.innerHTML =
                    '<i class="fas fa-copy"></i>';

                },
                1500
              );

            } catch {

              button.innerHTML =
                "Error";

            }

          }
        );

      }
    );

    /* =====================================================
       EXTERNAL LINKS
    ===================================================== */

    const links =
      document.querySelectorAll(
        'a[href^="http"]'
      );

    links.forEach(
      link => {

        if (
          !link.href.includes(
            window.location.hostname
          )
        ) {

          link.setAttribute(
            "target",
            "_blank"
          );

          link.setAttribute(
            "rel",
            "noopener noreferrer"
          );

        }

      }
    );

    /* =====================================================
       SMOOTH IMAGE LOADING
    ===================================================== */

    const images =
      document.querySelectorAll(
        ".blog-content img"
      );

    images.forEach(
      img => {

        img.loading =
          "lazy";

        img.decoding =
          "async";

      }
    );

    /* =====================================================
       ACTIVE NAVIGATION
    ===================================================== */

    const currentPath =
      window.location.pathname;

    const navLinks =
      document.querySelectorAll(
        ".nav-link"
      );

    navLinks.forEach(
      link => {

        if (
          currentPath ===
          new URL(
            link.href
          ).pathname
        ) {

          link.style.color =
            "#ffffff";

        }

      }
    );

    /* =====================================================
       MOBILE MENU CLOSE
    ===================================================== */

    const navMenu =
      document.getElementById(
        "navMenu"
      );

    const navLinksMobile =
      document.querySelectorAll(
        ".nav-menu a"
      );

    navLinksMobile.forEach(
      link => {

        link.addEventListener(
          "click",
          () => {

            if (
              window.innerWidth < 768
            ) {

              navMenu.classList.remove(
                "show"
              );

            }

          }
        );

      }
    );

  }
);



/* =========================================================
   TABLE OF CONTENTS
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  const toc =
    document.getElementById("table-of-contents");

  if (!toc) return;

  /* =========================================================
     ARTICLE CONTENT
  ========================================================= */

  const content =
    document.querySelector("article");

  if (!content) return;

  const headings =
    content.querySelectorAll("h2, h3");

  if (!headings.length) {

    toc.innerHTML =
      "<span style='color:var(--muted);font-size:.8rem;'>No sections</span>";

    return;
  }

  /* =========================================================
     BUILD TOC
  ========================================================= */

  headings.forEach((heading, index) => {

    if (!heading.id) {
      heading.id = `section-${index}`;
    }

    const link =
      document.createElement("a");

    link.href =
      `#${heading.id}`;

    link.textContent =
      heading.textContent;

    if (heading.tagName === "H3") {
      link.classList.add("toc-h3");
    }

    toc.appendChild(link);
  });

  /* =========================================================
     ACTIVE SECTION
  ========================================================= */

  const tocLinks =
    document.querySelectorAll(
      "#table-of-contents a"
    );

  const observer =
    new IntersectionObserver(

      entries => {

        entries.forEach(entry => {

          if (entry.isIntersecting) {

            tocLinks.forEach(link => {
              link.classList.remove("active");
            });

            const activeLink =
              document.querySelector(
                `#table-of-contents a[href="#${entry.target.id}"]`
              );

            if (activeLink) {
              activeLink.classList.add("active");
            }
          }
        });

      },

      {
        rootMargin:
          "-20% 0px -70% 0px"
      }
    );

  headings.forEach(heading => {
    observer.observe(heading);
  });

});



