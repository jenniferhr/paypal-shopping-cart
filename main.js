window.paypal
  .Buttons({
    createOrder() {
      const form = document.getElementById('buyers-info-form');
      if (!form.checkValidity()) {
        alert('Please, fill all fields correctly.');
        return null;
      }

      const firstName = document.getElementById('first-name');
      const lastName = document.getElementById('last-name');
      const email = document.getElementById('email');
      const phoneNumber = document.getElementById('phone-number');
      const addressLine1 = document.getElementById('address-line-1');
      const addressLine2 = document.getElementById('address-line-2');
      const state = document.getElementById('state');
      const zipCode = document.getElementById('zip-code');
      const country = document.getElementById('country');
      return fetch(`/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: firstName.value,
          lastName: lastName.value,
          email: email.value,
          phoneNumber: phoneNumber.value,
          addressLine1: addressLine1.value,
          addressLine2: addressLine2.value,
          state: state.value,
          zipCode: zipCode.value,
          country: country.value,
          cart: [
            {
              sku: "0001",
              quantity: "1",
            },
          ]
        })
      })
      .then((response) => response.json())
      .then((order) => order.id);
    },
    onApprove(data) {
      return fetch(`/api/orders/${data.orderID}/capture`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
    .then((response) => response.json())
    .then((details)=>{
      document.getElementById('buyers-info').style.display = 'none';
      document.getElementById('paypal-button-container').style.display = 'none';
      console.log(details)
      document.getElementById('thank-you-message').style.display = 'block';
      document.getElementById('transaction-id').innerText =
            'Transaction id: ' + details.id;
    });
    }
  })
  .render("#paypal-button-container");
