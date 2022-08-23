# Configuração
A seguir apresentamos a descrição dos ambientes de experimentação. É preciso que um servidor web seja instanciado, em sua máquina, rodar a aplicação que acessará os vídeos em diferentes locais (escalas).

# Servidor
Para configurar o servidor web, siga os links abaixo para o sistema operacional.

* [Linux](https://ubuntu.com/tutorials/install-and-configure-apache#1-overview)
* [Windows](https://httpd.apache.org/docs/current/platform/windows.html)
* [MacOS](https://medium.com/@crmcmullen/how-to-install-apache-on-macos-10-13-high-sierra-and-10-14-mojave-using-homebrew-3cb6bf6e3cd4)

---------------
# Cliente

Para o configurar o cliente web não precisamos de nenhuma novo software. Verifique apenas se a versão do seu navegador tem suporte ao MSE. Se não tiver, atualize a versão ou escolha um navegador que tenha suporte. Recomendo o uso do Chrome. Veja [aqui](https://caniuse.com/mediasource) a relação de navegadores que implementam a API MSE.

------------

# Práticas

Aqui vamos apresentar os arquivos necessários para que você implemente as práticas propostas nesse laboratório.

1. Configuração padrão

```html
<!doctype html>
<html>
    <head>
        <title>Dash.js + Configuração Padrão</title>
        <style>
            video {
                width: 640px;
                height: 360px;
            }
        </style>
    </head>
    <body>
        <div>
            <video id="videoPlayer" controls></video>
        </div>
        <script src="js/dash.all.min.js"></script>
        <script>
            (function(){
                var video = document.querySelector("#videoPlayer");
                var url = "https://dash.akamaized.net/envivio/EnvivioDash3/manifest.mpd";
                var player = dashjs.MediaPlayer().create();
                player.initialize(video, url, true);
            })();
        </script>
    </body>
</html>
```

2. Configuração com o MediaPlayerFactory

```html
<!doctype html>
<html>
    <head>
        <title>Dash.js + MediaPlayerFactory</title>
        <style>
            video {
                width: 640px;
                height: 360px;
            }
        </style>
    </head>
    <body>
        <div>
            <video data-dashjs-player autoplay src="https://dash.akamaized.net/envivio/EnvivioDash3/manifest.mpd" controls>
            </video>
        </div>
        <script src="js/dash.all.min.js"></script>
    </body>
</html>
```

3. Utilizando regras primárias

```html
<!doctype html>
<html>
    <head>
        <title>Dash.js + ABRStrategy</title>
        <style>
            video {
                width: 640px;
                height: 360px;
            }
        </style>
    </head>
    <body>
        <div>
            <video id="videoPlayer" controls></video>
        </div>
        <script src="js/dash.all.min.js"></script>
        <script>
            (function(){
                var video = document.querySelector("#videoPlayer");
                var url = "https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd";
                var player = dashjs.MediaPlayer().create();

                player.updateSettings({
                'streaming': {
                    'abr': {
                        'useDefaultABRRules': true,
                        'ABRStrategy': 'abrBola'
                    }
                }
                });

                var currentSettings = player.getSettings();
                console.log(currentSettings);

                player.initialize(video, url, true);
            })();
        </script>
    </body>
</html>
```
4. Utilizando regras customizadas

```html
<!doctype html>
<html>
    <head>
        <title>Dash.js + ABR Rule Customizada</title>
        <style>
            video {
                width: 640px;
                height: 360px;
            }
        </style>
    </head>
    <body>
        <div>
            <video id="videoPlayer" controls></video>
        </div>
        <script src="js/dash.all.min.js"></script>
        <script src="js/LowestBitrateRule.js" class="code"></script>
        <script>
            (function(){
                var video = document.querySelector("#videoPlayer");
                var url = "https://dash.akamaized.net/akamai/streamroot/050714/Spring_4Ktest.mpd";
                var player = dashjs.MediaPlayer().create();

                /* don't use dash.js default rules */
                player.updateSettings({
                    'streaming': {
                        'abr': {
                            'useDefaultABRRules': false
                        }
                    }
                });

                player.addABRCustomRule('qualitySwitchRules', 'LowestBitrateRule', LowestBitrateRule);

                var currentSettings = player.getSettings();
                console.log(currentSettings);

                player.initialize(video, url, true);
            })();
        </script>
    </body>
</html>
```
5. Explorando métricas e outras informações

```html
<!doctype html>
<html>
    <head>
        <title>Dash.js + Explorando Métricas</title>
        <style>
            video {
                width: 640px;
                height: 360px;
            }
        </style>
    </head>
    <body>
        <div>
            <video id="videoPlayer" controls></video>
        </div>
        <script src="js/dash.all.min.js"></script>
        <script src="js/LowestBitrateRule_2.js" class="code"></script>
        <script>
            (function(){
                var video = document.querySelector("#videoPlayer");
                var url = "https://dash.akamaized.net/akamai/streamroot/050714/Spring_4Ktest.mpd";
                var player = dashjs.MediaPlayer().create();

                /* don't use dash.js default rules */
                player.updateSettings({
                    'streaming': {
                        'abr': {
                            'useDefaultABRRules': false
                        }
                    }
                });

                player.addABRCustomRule('qualitySwitchRules', 'LowestBitrateRule', LowestBitrateRule);

                var currentSettings = player.getSettings();
                console.log(currentSettings);

                player.initialize(video, url, true);
            })();
        </script>
    </body>
</html>
```

6. Criando uma regra baseada em Vazão

```html
<!doctype html>
<html>
    <head>
        <title>Dash.js + Explorando Métricas</title>
        <style>
            video {
                width: 640px;
                height: 360px;
            }
        </style>
    </head>
    <body>
        <div>
            <video id="videoPlayer" controls></video>
        </div>
        <script src="js/dash.all.min.js"></script>
        <script src="js/ThroughputBasedRule.js" class="code"></script>
        <script>
            (function(){
                var video = document.querySelector("#videoPlayer");
                var url = "https://dash.akamaized.net/akamai/streamroot/050714/Spring_4Ktest.mpd";
                var player = dashjs.MediaPlayer().create();

                /* don't use dash.js default rules */
                player.updateSettings({
                    'streaming': {
                        'abr': {
                            'useDefaultABRRules': false
                        }
                    }
                });

                player.addABRCustomRule('qualitySwitchRules', 'ThroughputBasedRule', ThroughputBasedRule);

                var currentSettings = player.getSettings();
                console.log(currentSettings);

                player.initialize(video, url, true);
            })();
        </script>
    </body>
</html>
```
Os arquivos javaScript associados às práticas apresentadas anteriormente estão disponíveis para consulta e acesso no repositório @icc453/dash.js-hands-on.
