# Pacote de assets do Windows XP — onde colocar cada coisa

Copie a pasta `assets/winxp/` deste zip para a MESMA pasta do seu `index.html` no GitHub
(o caminho final é `assets/winxp/...`, ao lado do index.html). Se a pasta já existe, mescle:
quando o arquivo já existir com o mesmo nome, pode manter o seu ou substituir (são os mesmos).

Todos os nomes já estão no formato que o código pede (minúsculas, sem espaços).

## Pasta → o que tem → o que mudou de nome

Fonts/        tahoma.ttf, framdit.ttf                       (sem mudança)
Icons/        WinIcons_16.png, WinIcons_32.png, WinIcons_48.png  (sem mudança; o jogo usa o _32)
Cursor/       27 ponteiros default_*.png                    (sem mudança; o jogo usa 8, o resto
              — redimensionar, seta pra cima, caneta, rolagem — já fica pronto para uso)
Sounds/       30 sons .wav
              "Windows XP Startup.wav"  ->  windows_xp_startup.wav   (mesma regra para todos:
              minúsculas e espaço vira "_")
Wallpapers/   21 papéis de parede, CONVERTIDOS de .png para .jpg (qualidade 95, 800x600)
              Bliss.png -> bliss.jpg, Windows_XP_Home_Edition.png -> windows_xp_home_edition.jpg ...
Logo/         boot.png  <- veio de "Boot Settings Screen.png" (1920x1080), com a barra de
                           progresso apagada, porque o jogo desenha a própria barra por cima
              WindowsLogo-small.png                         (sem mudança)
              windows_2000.png               <- era 53df31d9...png
              windows_xp_professional.png    <- era a3506953...png
              windows_xp.png                 <- era ee826d06...png
Misc/         mineswapper.png                (sem mudança)
Clip/         (NÃO está neste zip, por causa do tamanho: veja WinXp_clippy_1.zip e WinXp_clippy_2.zip)

## UI/ — fatiado por mim a partir de "Frame/UI Theme.png" (20 arquivos)
Pasta: assets/winxp/UI/
  cap_min_n/h/p.png, cap_max_n/h/p.png, cap_restore_n/h/p.png, cap_close_n/h/p.png
      botões minimizar/maximizar/restaurar/fechar, 21x21, em 3 estados:
      n = normal, h = mouse em cima, p = apertado
  start_n/h/p.png     botão Iniciar verde (97x32), normal / mouse em cima / apertado
  title_mid.png       barra de título ativa (66x30, cantos de cima arredondados)
  title_mid_off.png   barra de título de janela inativa (clara)
  taskbar.png         fundo da barra de tarefas
  tray.png            fundo da bandeja (relógio). Esta NÃO existe na folha: criei um
                      degradê azul-claro no padrão do Luna (a folha só tem a barra azul)
  flag.png            bandeira do Windows: usei a WindowsLogo-small.png (bandeira do XP),
                      porque a bandeira da folha é a do Windows 98

## O que NÃO está neste zip
- Fonts/trebucbd.ttf (Trebuchet MS Bold): não existe no pack. Vemos isso na parte das fontes.
