# MongoDB Integration Setup Guide

## Prerequisites
1. Install MongoDB locally or use MongoDB Atlas (cloud)
2. Ensure MongoDB is running on your system

## Local MongoDB Setup

### 1. Install MongoDB
```bash
# Windows (using Chocolatey)
choco install mongodb

# macOS (using Homebrew)
brew install mongodb-community

# Ubuntu/Debian
sudo apt-get install mongodb
```

### 2. Start MongoDB Service
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
# or
mongod --dbpath /data/db
```

### 3. Environment Variables
Create a `.env.local` file in your project root:
```env
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=aml_monitoring
EXCHANGE_RATE_API_KEY=4299650994279511afe6ed48
```

## MongoDB Atlas Setup (Cloud)

### 1. Create Atlas Account
1. Go to https://www.mongodb.com/atlas
2. Sign up for a free account
3. Create a new cluster

### 2. Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your database user password

### 3. Environment Variables
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
MONGODB_DB=aml_monitoring
EXCHANGE_RATE_API_KEY=4299650994279511afe6ed48
```

## Database Collections

The application will automatically create these collections:
- `transactions` - Stores all transaction records
- `risk_reports` - Stores detailed risk analysis reports

## Indexes

The following indexes are automatically created for optimal performance:
- `account_id` - For account-based queries
- `transaction_date` - For date-based queries
- `isSuspicious` - For filtering suspicious transactions
- `{account_id: 1, transaction_date: 1}` - Compound index for structuring detection

## Testing the Connection

Run the application and check the console for:
```
Connected to MongoDB successfully
```

## Troubleshooting

### Common Issues:
1. **Connection Refused**: Ensure MongoDB is running
2. **Authentication Failed**: Check username/password in connection string
3. **Network Timeout**: Check firewall settings for Atlas connections

### Useful Commands:
```bash
# Check if MongoDB is running
mongosh --eval "db.adminCommand('ismaster')"

# View databases
mongosh --eval "show dbs"

# View collections
mongosh aml_monitoring --eval "show collections"
```
