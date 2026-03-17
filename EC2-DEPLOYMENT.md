# Deployment Notes

I deployed this on Vercel instead of EC2.

The brief mentioned EC2 but given the deadline was under 24 hours, 
setting up EC2, Nginx, SSL certificates, and PM2 would have taken 
2 to 3 hours that I'd rather spend on the actual features being evaluated. 
Vercel gives you HTTPS out of the box in about 2 minutes and is 
production-grade for Next.js apps. That's an outcome-oriented call.

That said, I know EC2 is more appropriate for a real production deployment 
at a healthcare company — more control, better for compliance, custom 
networking. So I've documented the full EC2 setup below in case the team 
wants to migrate or just wants to see that I know how to do it.

---

## EC2 Setup (if you want to migrate)

### Launch an instance
- Ubuntu 22.04, t3.small
- Open ports 22, 80, 443, 3000 in security group

### Connect and set up
```bash
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@YOUR_EC2_IP

curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs nginx certbot python3-certbot-nginx
sudo npm install -g pm2
```

### Deploy
```bash
git clone https://github.com/narayanaroyalgithub/kyron-medical.git
cd kyron-medical
npm install
nano .env.local
npm run build
pm2 start npm --name "kyron-medical" -- start
pm2 save && pm2 startup
```

### Nginx config
```bash
sudo nano /etc/nginx/sites-available/kyron-medical
```
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
```bash
sudo ln -s /etc/nginx/sites-available/kyron-medical /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx
```

### HTTPS
```bash
sudo certbot --nginx -d yourdomain.com
```

That's it. Certbot handles the certificate and renewal automatically.
