const search = () => {
  const searchInput = document
    .getElementById("search-input")
    .value.toUpperCase();
  const productList = document.getElementById("product-list");
  const product = document.querySelectorAll(".card");
  const productName = document.getElementsByTagName("a");

  for (var i = 0; i < productName.length; i++) {
    let match = product[i].getElementsByTagName("a")[1];
    if (match) {
      let searchValue = match.textContent || match.innerHTML;
      if (searchValue.toUpperCase().indexOf(searchInput) > -1) {
        product[i].style.display = "";
      } else {
        product[i].style.display = "none";
      }
    }
  }
};
