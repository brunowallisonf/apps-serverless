#1 passo criar arquivo de politicas da function
#2 criar as roles de segurança da aws

# aws iam create-role --role-name lambda-exemplo  --assume-role-policy-document file://politicas.json | tee logs/role.logs
#criando funcao lambda
# aws lambda create-function --function-name hello-cli \ 
#     --zip-file fileb://function.zip --handler index.handler \
#     --runtime nodejs12.x \
#     --role \ 
#     arn:aws:iam::317354187713:role/lambda-exemplo | tee logs/lambda-create-log

#invocando funcao

# aws lambda invoke \
#     --function-name hello-cli \
#     --log-type Tail \
#     logs/lambda-exec.log


#atualizar funcao
# zip function.zip index.json

# aws lambda update-function-code \
#     --zip-file fileb://function.zip \
#     --function-name hello-cli \
#     --publish \
#     | tee logs/lambda-update.log

# remover recursos
aws lambda delete-function --function-name hello-cli

aws iam delete-role  --role-name lambda-example