export const welcomeEmailHtml = (userName) => {
  return `
  <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to ProductHub!</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            background-color: #007bff;
            color: #ffffff;
            padding: 20px;
        }
        .header h1 {
            margin: 0;
        }
        .content {
            padding: 20px;
        }
        .content p {
            font-size: 16px;
            color: #333333;
        }
        .content .center {
            text-align: center;
            margin-top: 20px;
        }
        .content a {
            display: inline-block;
            margin-top: 20px;
            padding: 10px 20px;
            background-color: #007bff;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
        }
        .products {
            margin-top: 30px;
        }
        .product {
            margin-bottom: 20px;
        }
        .product h3 {
            color: #007bff;
        }
        .product p {
            color: #555555;
        }
        .footer {
            padding: 20px;
            font-size: 14px;
            color: #888888;
        }
        .footer a {
            color: #007bff;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to ProductHub!</h1>
        </div>
        <div class="content">
            <p>Hello ${userName},</p>
            <p>Thank you for joining ProductHub! We are thrilled to have you with us 🥳🥳. Our platform offers a range of products and services designed to help you manage your business effectively.</p>
            <p>Here are some of our major offerings:</p>
        </div>
        <div class="products">
            <div class="product">
                <h3>Product Management Tool</h3>
                <p>Our Product Management Tool helps you organize and track your products with ease, ensuring you always have the information you need at your fingertips.</p>
            </div>
            <div class="product">
                <h3>Inventory Management System</h3>
                <p>Keep track of your inventory levels, monitor stock movements, and manage your supply chain efficiently with our advanced Inventory Management System.</p>
            </div>
            <div class="product">
                <h3>Customer Relationship Management (CRM)</h3>
                <p>Enhance your customer interactions and streamline your sales processes with our integrated CRM solution.</p>
            </div>
        </div>
        <div class="content">
            <div class="center">
                <p>To get started, log in to your account and explore our features:</p>
                <a href="/">Log In</a>
            </div>
            <p>Best regards,<br>The ProductHub Team</p>
        </div>
        <div class="footer">
            <p>&copy; 2024 ProductHub. All rights reserved.</p>
            <p><a href="/">Unsubscribe</a> | <a href="/">Privacy Policy</a></p>
        </div>
    </div>
</body>
</html>

  `;
};
