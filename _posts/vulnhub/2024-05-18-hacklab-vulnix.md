---
layout: default
title: HackLAB Vulnix Vulnhub Machine manually solved sudo privilege escalation machine
category: vulnhub
---

# HackLAB: Vulnix

- [Tools](#tools)
- [Gaining Access](#gaining-ccess)
- [Priviledge Escalation](#priviledge-escalation)

Machine: [https://www.vulnhub.com/entry/hacklab-vulnix%2C48/](https://www.vulnhub.com/entry/hacklab-vulnix%2C48/)

Now we can Download the 7z file and solve the machine by hosting it inside a virtual box.
## Tools

- [NMap](https://nmap.org/)
- [hydra](https://github.com/vanhauser-thc/thc-hydra)
- ssh

## Gaining Access

- I used the Bridged Adapter setting so my ip is 192.168.0.8.
- At first scanned with nmap. Nmap Shows some open ports 22 ssh, 25 smtp, 79 finger, 110 POP3, 111 rpcbind etc. 
- If we run finger user enumeration script of pentestermonkey with command `perl finger-user-enum.pl -U /opt/metasploit-framework/embedded/framework/data/wordlists/unix_users.txt -t IP_ADRESS` we can get many usernames including user.
- If we bruteforce port 22 for ssh with hydra, we will get the password for user user is `letmein`. We can use command, `hydra -l user -P /opt/wordlist/rockyou.txt 192.168.0.8 ssh -t 4` to bruteforce ssh with hydra.
- If we login to ssh and check id we can get an user inside `/etc/passwd` as vulnix 2008.
- After creating a user as 2008 vulnix, we can `mount /home/vulnix` using nfs. 
- Generate ssh key with ssh-keygen
- Now upload ssh key to the vulnix machine 
- Now we can `ssh` to the machine, with `ssh vulnix@192.168.0.8`.
    
## Priviledge Escalation  

- `sudo -l` shows `/etc/exports` is editable. So, added `/root  *(rw,sync,no_root_squash)` to root.
- Now rebooting the VM will add root to nfs, and we can mount root directory. 
- So we got the flag inside `trophy.txt` is `cc614640424f5bd60ce5d5264899c3be`.

Author: [Zishan Ahamed Thandar](https://ZishanAdThandar.github.io)



