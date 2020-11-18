class SWAPI_API {
  constructor() {
    this.url = "https://swapi.dev/api/people/";
    this.urlPage = "?page=";
    this.page = 1;
    this.data = {};
    this.getData();
    this.people = [];
    this.title = document.getElementById("title_text");
    this.selection_text = document.getElementById("selection_text");
    this.selection_text_div = document.getElementById("download_options");
    this.pageNumberText = document.getElementById("pg_number");
    this.csvContent = "data:text/csv;charset=utf-8,";
    this.csvRows = [];
  }
  /* Function to retrieve each page of results from api based on page number selected */
  getData() {
    fetch(this.url + this.urlPage + this.page)
      .then((response) => response.json())
      .then((json) => {
        this.data = json.results;
        this.displayData();
      })
      .catch((e) => {
        console.log(e);
      });
  }
  /* function that renders 9 cards with the data returned from api - default image used as api doesn't provide one */
  displayData() {
    let container = document.getElementById("cards_container");

    container.innerHTML = "";
    for (let i = 0; i < 9; i++) {
      let person = this.data[i];

      /* Decides whether to add active state on rendering characters, based on characters already selected and in array */
      let classes = "card_body";

      if (this.people.includes(person.name)) {
        classes += " card_body_active";
      }

      /* Template HTML code for the character cards */
      container.innerHTML += `
        <button onclick="api.selectPerson(${i})">
            <div class="card">
                <img class="img" src="assets/image_placeholder.jpg" alt="">
                <div id="option_${i}" class="${classes}"><p>${person.name}</p></div>
            </div>
        </button>
      `;
    }
  }
  /* Function that changes whether a character is selected or not */
  selectPerson(index) {
    let name = this.data[index].name;
    let e = document.getElementById("option_" + index);

    /* If already selected return to unselected state */
    if (this.people.includes(name)) {
      this.people = this.people.filter((item) => item !== name);
      e.classList.toggle("card_body_active");

      /* Hide download buttons if option removed */
      this.title.style.display = "block";
      this.selection_text_div.style.display = "none";

      /* If not already selected add to array and change state */
    } else if (this.people.length < 3) {
      this.people.push(name);
      e.classList.toggle("card_body_active");

      /* If 3 characters selected show buttons to allow for download and update text*/
      if (this.people.length == 3) {
        this.allowDownload();
        api.download();
      }
    }
  }
  /* Shows download buttons & update text, called from the select person function when 3 characters selected */
  allowDownload() {
    this.title.style.display = "none";
    this.selection_text_div.style.display = "block";

    let selections = `You have selected ${this.people[0]}, ${this.people[1]} and ${this.people[2]}`;

    this.selection_text.innerHTML = selections;
  }
  /* Deselect all options and clear array of choices */
  reset() {
    this.title.style.display = "block";
    this.selection_text_div.style.display = "none";
    this.people = [];

    /* Sets class states all to unselected */
    let active_choices = document.getElementsByClassName("card_body_active");
    for (let i = 0; i < active_choices.length; i) {
      active_choices[i].classList.remove("card_body_active");
    }
  }
  /* Decreases the page number and calls displayData() and getData() to update page */
  backPage() {
    console.log("back");
    if (this.page != 1) {
      this.page -= 1;
      this.displayData();
      this.getData();
    }
    this.pageNumberText.innerHTML = this.page;
  }
  /* Increases the page number and calls displayData() and getData() to update page */
  nextPage() {
    console.log("forward");
    if (this.page != 8) {
      this.page += 1;
      this.getData();
    }
    this.pageNumberText.innerHTML = this.page;
  }
  /* Creates the CSV string ready for download */
  createCSVData() {
    let needHeaders = true;

    /* resets default csvContent value incase second download */
    this.csvContent = "data:text/csv;charset=utf-8,";

    /* loop for each character selected to get all data */
    this.people.forEach((element) => {
      fetch(this.url + "?search=" + element)
        .then((response) => response.json())
        .then((data) => {
          let results = data.results[0];

          /* Sets headers in CSV file, changes to false after the first iteration of 
             the loop so that it only gets added to the CSV string once */

          if (needHeaders) {
            for (const prop in results) {
              this.csvContent += "," + prop;
            }
            needHeaders = false;
            this.csvContent += "\r\n";
          }

          /* Loops through each prop in json response from each character and adds it to CSV string */
          for (const prop in results) {
            this.csvContent += "," + results[prop];
          }
          this.csvContent += "\r\n";
        })
        /* Catches any errors from api calls */
        .catch((error) => {
          console.log(error);
        });
    });
  }
  /* Function called by button to start download */
  download() {
    let downloadLink = document.getElementById("downlaod_link");
    /* Calls the createCSVData() to create the string for the download */
    this.createCSVData();

    /* Uses timeout to allow the fetch statements in the createCSVData() to finish before downloading the file */
    setTimeout(() => {
      /* Download file */
      let encodedUri = encodeURI(this.csvContent);
      downloadLink.setAttribute("href", encodedUri);
      downloadLink.setAttribute("download", "characters.csv");
    }, 1000);
    /* Calls reset function to reset the UI */
    /* this.reset(); */
  }
}

/* Triggers the instance of the Swapi Api Class */
window.onload = () => {
  api = new SWAPI_API();
};
document.getElementById("downlaod_link").onclick = () => {
  api.reset();
};
