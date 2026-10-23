document.addEventListener(
  "DOMContentLoaded",
  function () {

    const navToggle =
      document.getElementById(
        "navToggle"
      );

    const navMenu =
      document.getElementById(
        "navMenu"
      );

    const labsToggle =
      document.getElementById(
        "labsToggle"
      );

    const labsMenu =
      document.getElementById(
        "labsMenu"
      );

    /* =========================================================
       MOBILE NAV
    ========================================================= */

    if (
      navToggle &&
      navMenu
    ) {

      navToggle.addEventListener(
        "click",
        function (e) {

          e.stopPropagation();

          navMenu.classList.toggle(
            "show"
          );

        }
      );

    }

    /* =========================================================
       MOBILE LABS DROPDOWN
    ========================================================= */

    if (
      labsToggle &&
      labsMenu
    ) {

      labsToggle.addEventListener(
        "click",
        function (e) {

          if (
            window.innerWidth <= 900
          ) {

            e.preventDefault();

            e.stopPropagation();

            labsMenu.classList.toggle(
              "show"
            );

          }

        }
      );

    }

    /* =========================================================
       CLOSE OUTSIDE
    ========================================================= */

    document.addEventListener(
      "click",
      function (e) {

        if (
          window.innerWidth <= 900
        ) {

          if (
            navMenu &&
            !navMenu.contains(e.target) &&
            !navToggle.contains(e.target)
          ) {

            navMenu.classList.remove(
              "show"
            );

          }

          if (
            labsMenu &&
            !labsMenu.contains(e.target) &&
            !labsToggle.contains(e.target)
          ) {

            labsMenu.classList.remove(
              "show"
            );

          }

        }

      }
    );

  }
);
