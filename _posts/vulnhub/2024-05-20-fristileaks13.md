---
layout: default
title: FristiLeaks 1.3 vulnhub machine solved using nmap, dirb and netcat
category: vulnhub
---

# FristiLeaks: 1.3

- [Tools](#tools)
- [Gaining Access](#gaining-access)
- [Priviledge Escalation](#priviledge-escalation)

Machine: [https://www.vulnhub.com/entry/fristileaks-13,133/](https://www.vulnhub.com/entry/fristileaks-13,133/)

## Tools

- [NMap](https://nmap.org/)
- dirb
- netcat

## Gaining Access

- Download VM and Install OVA file. Open the machine, you will get the IP. In my case IP is 192.168.0.10.
- Basic `NMap` scan shows http port 80 is open. There is a website running there. 
- Running directory busting tool `dirb` gives `robots.txt` url. 
- There are three links inside `robots.txt`. But those links are not useful.
- But all those links are rabbit holes. So, I guessed fristi as wordlist as the word fristi is everywhere and found this link, `http://192.168.0.10/fristi/`.
- If we open source code, we can find username as `eezeepz` Inside an html comment. 
- We can find `base64` string inside another html comment. 
- If we convert the `base64` to `png`, it will load the image with the password `keKkeKKeKKeKkEkkEk`. 
- Now we can login with username `eezeepz` and password `keKkeKKeKKeKkEkkEk`.
- Now we have an interface to upload files. 
- Tried to upload a shell but only image files were allowed. So, I downloaded the pentester monkey php reverse shell from https://raw.githubusercontent.com/pentestmonkey/php-reverse-shell/master/php-reverse-shell.php and updated the ip port to machine ip and listener port. Then renamed the file with `.jpg` extension.
- If we open a `netcat` listener with `nc -lvp port`. Then open the link `http://{VM_IP}/fristi/uploads/{upload_file_name}` then we will get reverse shell.

## Priviledge Escalation

- By running `uname -a` we can find that version is vulnerable to `dirty cow`. I used this exploit https://www.exploit-db.com/exploits/40839 and added a user named `firefart` as root user with password `password`.
- Now we can simply get a `tty shell` to make the shell interactive with `python -c 'import pty; pty.spawn("/bin/bash")'` and login as root user `firefart` with `su firefart`.
- Now we can simply got to root directory and find a file with name `fristileaks_secrets.txt`. Inside that file we have the flag `Y0u_kn0w_y0u_l0ve_fr1st1`. 

Author: [Zishan Ahamed Thandar](https://ZishanAdThandar.github.io)

