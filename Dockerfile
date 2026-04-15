FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

# Expose port (assuming 5000 based on process.env.PORT || 5000 in server.js)
EXPOSE 5000

CMD ["npm", "start"]
