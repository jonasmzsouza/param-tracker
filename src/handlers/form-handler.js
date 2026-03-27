import { removeURLParams } from "../utils/params.js";

export function createFormHandler(instance) {
  return {
    /**
     * Adds UTM parameters to the form before submission, avoiding duplicates.
     * @param {HTMLFormElement} formElement
     * @returns {void}
     */
    addParamsToForm(formElement) {
      if (!(formElement instanceof HTMLFormElement)) return;

      const locationHash = window.location.hash;

      const locationSearch = locationHash.includes("?")
        ? "?" + locationHash.split("?")[1]
        : window.location.search;

      if (!locationSearch) return;

      const urlParams = new URLSearchParams(
        removeURLParams(instance.config, locationSearch)
      );

      for (const [key, value] of urlParams) {
        // Avoid duplicating parameters if there is already a field with the same name and value.
        const existingInput = formElement.querySelector(
          `input[name="${CSS.escape(key)}"][value="${CSS.escape(value)}"]`
        );

        if (!existingInput) {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = value;
          formElement.appendChild(input);
        }
      }
    },
  };
}