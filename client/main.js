window.paypal
  .Buttons({
    // sets up the details of the transaction, is called when the buyer clicks the PayPal button
    createOrder() {
          return fetch("http://localhost:3000/create-order", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              cart: [
                {
                  sku: "YOUR_PRODUCT_STOCK_KEEPING_UNIT",
                  quantity: "YOUR_PRODUCT_QUANTITY",
                },
              ]
            })
          })
          .then((response) => response.json())
          .then((order) => order.id);
        },
    // called after the buyer approves the transaction on paypal.com
    onApprove(data) {
    // This function captures the funds from the transaction.
    return fetch("http://localhost:3000/capture-paypal-order", {
      method: "POST",
      body: JSON.stringify({
        orderID: data.orderID
      })
    })
    .then((response) => response.json())
    .then((details) => {
      // This function shows a transaction success message to your buyer.
      alert('Transaction completed by ' + details.payer.name.given_name);
    });
  }
  })
  .render("#paypal-button-container");

// Example function to show a result to the user. Your site's UI library can be used instead.
function resultMessage(message) {
  const container = document.querySelector("#result-message");
  container.innerHTML = message;
}
