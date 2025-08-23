FROM nginx:alpine

# Copy the HTML and favicon files
COPY index.html /usr/share/nginx/html/
COPY favicon.svg /usr/share/nginx/html/

# Fix favicon permissions for nginx
RUN chmod 644 /usr/share/nginx/html/favicon.svg

# Copy environment substitution script
COPY substitute-env.sh /docker-entrypoint.d/substitute-env.sh
RUN chmod +x /docker-entrypoint.d/substitute-env.sh

EXPOSE 80