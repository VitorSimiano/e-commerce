# E-commerce

Projeto de loja virtual com frontend estático, API em Laravel e banco de dados MySQL. Os serviços são executados com Docker Compose.

## Tecnologias

- PHP 8.4
- Laravel 12
- MySQL 8.4
- Nginx
- Docker Compose
- JavaScript, HTML e CSS

## Estrutura do projeto

    e-commerce/
    ├── backend/                 # API Laravel
    │   ├── app/                 # Controllers, models, services e regras de negócio
    │   ├── database/            # Migrações e seeders
    │   ├── routes/api.php       # Rotas da API
    │   ├── Dockerfile           # Imagem do backend
    │   └── .env.example         # Exemplo de configuração local
    ├── frontend/                # Loja virtual
    │   ├── public/              # HTML, CSS e JavaScript
    │   ├── nginx/               # Configuração e proxy do Nginx
    │   └── Dockerfile           # Imagem do frontend
    └── compose.yaml             # Serviços e rede do projeto

## Requisitos

Instale no computador:

- Git
- Docker
- Docker Compose

O Composer e o PHP instalados diretamente no computador são opcionais quando o projeto é executado pelo Docker.

## Instalação

Clone o repositório e acesse a pasta do projeto:

    git clone https://github.com/VitorSimiano/e-commerce.git
    cd e-commerce

Crie o arquivo de configuração local do Laravel:

    cp backend/.env.example backend/.env

Suba os serviços:

    docker compose up -d --build

Gere a chave da aplicação Laravel:

    docker compose exec api php artisan key:generate

Execute as migrações do banco de dados:

    docker compose exec api php artisan migrate --force

Para carregar os dados de demonstração definidos nos seeders, execute:

    docker compose exec api php artisan db:seed --force

Execute os seeders somente se quiser inserir esses dados. Evite executá-los em um banco que já contém dados sem antes verificar o que cada seeder faz.

## Acessar a aplicação

Abra a loja no navegador:

    http://localhost:8080

A API é acessada pelo prefixo `/api` através do Nginx. Por exemplo:

    http://localhost:8080/api/products

O Nginx serve os arquivos do frontend e encaminha as requisições de `/api`, `/sanctum` e `/storage` para a API Laravel.

O frontend e a API se comunicam pela rede interna do Docker Compose. O endereço interno da API é `api:8000`; o endereço do MySQL para a API é `mysql:3306`.

## Serviços e portas

| Serviço | Endereço interno | Acesso no computador |
| --- | --- | --- |
| Frontend e Nginx | `frontend:80` | `http://localhost:8080` |
| API Laravel | `api:8000` | Acessada pelo Nginx |
| MySQL | `mysql:3306` | `localhost:3306`, se a porta estiver publicada no Compose |

A porta `8080` do computador é encaminhada para a porta `80` do container Nginx. A API não precisa ter sua porta publicada diretamente para o navegador.

## Configuração

O arquivo `backend/.env` contém configurações locais do Laravel, incluindo chave da aplicação, banco de dados, sessão e ambiente. Ele não deve ser enviado ao GitHub.

O arquivo `compose.yaml` define as configurações dos containers. Valores como `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`, `MYSQL_ROOT_PASSWORD`, `MYSQL_PORT` e `FRONTEND_PORT` podem ser configurados por variáveis de ambiente ou em um arquivo `.env` na raiz do projeto.

O `.env` da raiz, usado pelo Docker Compose para substituir variáveis do Compose, é diferente de `backend/.env`, usado pelo Laravel.

Não use as senhas de exemplo em produção. Configure credenciais fortes e não publique segredos no repositório.

## Autenticação

A autenticação da aplicação usa sessões Laravel com cookies e Sanctum para proteger as rotas da API.

O navegador armazena e envia automaticamente o cookie de sessão. As rotas protegidas usam o middleware `auth:sanctum`. O token CSRF é usado para proteger requisições que alteram dados.

O frontend solicita os cookies CSRF pela rota `/sanctum/csrf-cookie`. O endereço de API `/api` é configurado pelo Nginx e consumido pelo JavaScript do frontend.

## Comandos úteis

Verificar os serviços:

    docker compose ps

Acompanhar os logs:

    docker compose logs -f

Acompanhar os logs de um serviço específico:

    docker compose logs -f api
    docker compose logs -f mysql
    docker compose logs -f frontend

Verificar o estado das migrações:

    docker compose exec api php artisan migrate:status

Executar os testes:

    docker compose exec api php artisan test

Parar os serviços sem remover os dados do banco:

    docker compose down

Reconstruir as imagens e iniciar os serviços:

    docker compose up -d --build

Remover os containers, a rede e os volumes deste projeto:

    docker compose down -v

O comando `docker compose down -v` apaga os dados guardados nos volumes do projeto, incluindo o banco de dados.

## Desenvolvimento

O backend está em `backend/` e o frontend está em `frontend/public/`.

O Compose monta os arquivos locais do backend e do frontend nos respectivos containers. Alterações nesses arquivos ficam disponíveis no ambiente de desenvolvimento sem precisar publicar uma nova imagem. Para alterações em Dockerfiles ou dependências que afetem a imagem, reconstrua os serviços:

    docker compose up -d --build

## Observações para produção

A configuração atual é voltada ao desenvolvimento. Antes de publicar a aplicação, configure um domínio e HTTPS, substitua as credenciais de exemplo, desative o modo de depuração, proteja os segredos, planeje backups e use uma configuração de servidor adequada para produção. O servidor `php artisan serve` é destinado a desenvolvimento, não a produção.
