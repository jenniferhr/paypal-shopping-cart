const express = require('express')
const app = express(); 
require('dotenv').config();

const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PORT, PAYPAL_ENDPOINT_URL } = process.env;

app.use(express.static("."));
app.use(express.json());


/**
 * Generate an OAuth 2.0 access token for authenticating with PayPal REST APIs.
 * @see https://developer.paypal.com/api/rest/authentication/
 */
const generateAccessToken = async () => {
  try {
    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      throw new Error("MISSING_API_CREDENTIALS");
    }
    const auth = Buffer.from(
      PAYPAL_CLIENT_ID + ":" + PAYPAL_CLIENT_SECRET,
    ).toString("base64");
    const response = await fetch(`${PAYPAL_ENDPOINT_URL}/v1/oauth2/token`, {
      method: "POST",
      body: "grant_type=client_credentials",
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Failed to generate Access Token:", error);
  }
};

const createOrder = async (cart) => {
  try {
    const accessToken = await generateAccessToken();
  const url = `${PAYPAL_ENDPOINT_URL}/v2/checkout/orders`;
  const payload = {
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "USD",
          value: "10.00",
        },
        payee: {
          email_address: "sb-isvxd28892102@business.example.com",
        }
      },
    ],
    payment_source: {
      paypal: {
        email_address: cart.email,
        name: {
          given_name: cart.firstName,
          surname: cart.lastName,
        },
        phone: {
          phone_number: {
            national_number: cart.phoneNumber,
          },
        },
        address: {
          address_line_1: cart.addressLine1,
          address_line_2: cart.addressLine2,
          postal_code: cart.zipCode,
          admin_area_1: cart.state,
          country_code: cart.country,
        },
      },
    },
  }

  console.log(JSON.stringify(payload))

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
      throw new Error(`Failed to create order. Status: ${response.status}`);
    }
  
  return handleResponse(response);
  } catch (err) {
    throw err;
  }
  
};

const captureOrder = async (orderID) => {
  try {
    const accessToken = await generateAccessToken();
    const url = `${PAYPAL_ENDPOINT_URL}/v2/checkout/orders/${orderID}/capture`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to capture order. Status: ${response.status}`);
    }

    return handleResponse(response);
  } catch (err) {
    throw err
  }
};

async function handleResponse(response) {
  try {
    const jsonResponse = await response.json();
    return {
      jsonResponse,
      httpStatusCode: response.status,
    };
  } catch (err) {
    const errorMessage = await response.text();
    throw new Error(errorMessage);
  }
}

app.post("/api/orders", async (req, res) => {
  try {
    const { cart } = req.body;
    const { jsonResponse, httpStatusCode } = await createOrder(req.body);
    res.status(httpStatusCode).json(jsonResponse);
  } catch (error) {
    console.error("Failed to create order:", error);
    res.status(500).json({ error: "Failed to create order." });
  }
});

app.post("/api/orders/:orderID/capture", async (req, res) => {
  try {
    const { orderID } = req.params;
    const { jsonResponse, httpStatusCode } = await captureOrder(orderID);
    res.status(httpStatusCode).json(jsonResponse);
  } catch (error) {
    console.error("Failed to create order:", error);
    res.status(500).json({ error: "Failed to capture order." });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.resolve("./index.html"));
});

app.listen(PORT, () => {
  console.log(`server successfully running in http://localhost:${PORT}`)
})