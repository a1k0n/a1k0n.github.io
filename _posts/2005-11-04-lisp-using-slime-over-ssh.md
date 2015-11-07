---
title: Using SLIME over an SSH tunnel
layout: post
---
If you'd like to use emacs on one computer (i.e. your windows box at home) and
use [SLIME](http://common-lisp.net/project/slime/) to connect to a
Common Lisp process on a remote computer (i.e. your server at work), here's how
I do it.

First, create a startup file for your favorite Lisp implementation.

## lisp startup file

{% highlight lisp %}
(require 'asdf)
(asdf:oos 'asdf:load-op 'swank)
 
; start swank
(setf swank:*use-dedicated-output-stream* nil)
(setf swank:*communication-style* :fd-handler)
(swank:create-server :dont-close t)
{% endhighlight %}
 
Now edit your `~/.emacs` so that you've got something like the following in it:
 
## .emacs

{% highlight lisp %}
(require 'slime)
(require 'tramp)
 
(add-hook 'lisp-mode-hook (lambda () (slime-mode t)))
(add-hook 'inferior-lisp-mode-hook (lambda () (inferior-slime-mode t)))
 
(setq lisp-indent-function 'common-lisp-indent-function
      slime-complete-symbol-function 'slime-fuzzy-complete-symbol)
 
(slime-setup)
 
;;; If you want to tunnel through an intermediate host, such as your
;;; work firewall, use the following couple lines.  If you're using a
;;; Windows emacs, use 'plink' as below, otherwise substitute 'ssh'.
(add-to-list
 'tramp-default-proxies-alist
 '("\\.work-domain\\.com" nil "/plink:fwuserid@firewall.work-domain.com:/"))
(add-to-list
 'tramp-default-proxies-alist
 '("firewall\\.work-domain\\.com" nil nil))
 
(defvar *my-box-tramp-path*
  "/ssh:me@my-box.work-domain.com:")
 
(defvar *current-tramp-path* nil)
(defun connect-to-host (path)
  (setq *current-tramp-path* path)
  (setq slime-translate-from-lisp-filename-function
    (lambda (f)
      (concat *current-tramp-path* f)))
  (setq slime-translate-to-lisp-filename-function
    (lambda (f)
      (substring f (length *current-tramp-path*))))
  (slime-connect "localhost" 4005))
 
(defun my-box-slime ()
  (interactive)
  (connect-to-host *my-box-tramp-path*))
 
(defun my-box-homedir ()
  (interactive)
  (find-file (concat *server-tramp-path* "/home/me/")))
{% endhighlight %}

Now, load up the startup file you created on your host Lisp to start
the swank server.  Then, create an ssh tunnel, i.e. `ssh -L
4005:localhost:4005 me@my-work.com`.

Now you can `M-x my-box-slime` to connect through your SSH
tunnel to your work box; SLIME's `M-`. command will also
correctly open up the file containing the defun of whatever's under
your cursor, and `C-c C-k` works correctly, etc.  If you want
to open up some lisp file, `M-x my-box-homedir` is a convenient
shortcut.

## For Windows users

If you're using Windows and want to also use a multi-hop tramp method (i.e. ssh
into your work firewall, and then ssh from there to your server at work), be
aware that tramp 2.1.4 and prior has a bug; it's fixed in CVS and probably
2.1.5, which is not out yet.  Information and a patch is available [here](
http://lists.gnu.org/archive/html/tramp-devel/2005-10/msg00060.html).

You'll also want to use `plink` from the [PuTTY](
http://www.chiark.greenend.org.uk/~sgtatham/putty/) distribution in lieu of
ssh.  If you're doing multi-hop tramp, though, you need to use plink for the
first hop (Windows box -> "firewall" box) and ssh thereafter ("firewall" ->
"server").
