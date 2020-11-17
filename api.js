class SWAPI_API {
  constructor() {
    this.url = "https://swapi.dev/api/people/";
    this.data = {};
    this.getData();
  }
  getData() {
    fetch(this.url)
      .then((response) => response.json())
      .then((json) => {
        this.data = json.results;
      });
  }
}
