import { CrudManager, Scheduler, StringHelper } from "@bryntum/scheduler";
import "@bryntum/scheduler/scheduler.stockholm.css";

const dialog = document.querySelector("dialog");

const crudManager = new CrudManager({
  transport: {
    load: {
      url: "http://localhost:1338/api/load",
    },
    sync: {
      url: "http://localhost:1338/api/sync",
    },
  },
  autoLoad: true,
  autoSync: true,
  // This config enables response validation and dumping of found errors to the browser console.
  // It's meant to be used as a development stage helper only so please set it to false for production systems.
  validateResponse: true,
});

function updateToolbarButton(selectedResourceId) {
  let toolbarButton = scheduler.widgetMap.extraInfoButton;
  if (toolbarButton) {
    toolbarButton.html = `<button hx-get="http://localhost:1338/api/extra-info?id=${selectedResourceId}" hx-target=".dialog-info" class="b-widget b-button b-text b-box-item b-green">Get extra info <div class="loading-indicator"></div></button>`;
    // Manually process the updated part of the page with HTMX
    htmx.process(toolbarButton.element);
  }
}

const scheduler = new Scheduler({
  appendTo: document.body,
  date: new Date(2023, 10, 29),
  viewPreset: "day",
  crudManager,
  columns: [
    {
      type: "resourceInfo",
      text: "Name",
      width: 160,
    },
  ],
  tbar: [
    {
      type: "widget",
      ref: "resourceLabel",
      html: "No resource selected",
    },
    {
      type: "widget",
      ref: "extraInfoButton",
      icon: "b-fa b-fa-plus",
      html: "<button class='b-widget b-button b-text b-box-item b-green' disabled>Get extra info about the resource</button>",
    },
  ],
  listeners: {
    cellClick(props) {
      const selectedResourceName = props.record.data.name;
      const selectedResourceId = props.record.data.id;
      scheduler.widgetMap.resourceLabel.html = StringHelper.xss`Selected resource: ${selectedResourceName}`;
      updateToolbarButton(selectedResourceId);
    },
  },
});

document.body.addEventListener("htmx:beforeSwap", (e) => {
  dialog.showModal();
});

document
  .querySelector(".dialog-close-button")
  .addEventListener("click", () => dialog.close());

dialog.addEventListener("click", (e) => {
  const dialogDimensions = dialog.getBoundingClientRect();
  if (
    e.clientX < dialogDimensions.left ||
    e.clientX > dialogDimensions.right ||
    e.clientY < dialogDimensions.top ||
    e.clientY > dialogDimensions.bottom
  ) {
    dialog.close();
  }
});
