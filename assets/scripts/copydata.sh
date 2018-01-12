#!/bin/bash -e

sudo yum install wget -y;
mkdir datalake-data;
cd datalake-data;
wget https://s3.amazonaws.com/yash-quickstart-datalake-datasets/quickstart-datalake-yash/data/v2/customers/customerData.csv;
wget https://s3.amazonaws.com/yash-quickstart-datalake-datasets/quickstart-datalake-yash/data/v2/demographics/demographics_data_20170520.csv;
wget https://s3.amazonaws.com/yash-quickstart-datalake-datasets/quickstart-datalake-yash/data/v2/orders/order_data.csv;
wget https://s3.amazonaws.com/yash-quickstart-datalake-datasets/quickstart-datalake-yash/data/v2/products/products.csv2013;
wget https://s3.amazonaws.com/yash-quickstart-datalake-datasets/quickstart-datalake-yash/data/v2/products/products.csv2014;
wget https://s3.amazonaws.com/yash-quickstart-datalake-datasets/quickstart-datalake-yash/data/v2/products/products.csv2015;
wget https://s3.amazonaws.com/yash-quickstart-datalake-datasets/quickstart-datalake-yash/data/v2/products/products.csv2016;
aws s3 cp demographics_data_20170520.csv s3://$1;
aws s3 cp customerData.csv s3://$1;
aws s3 cp order_data.csv s3://$1;
aws s3 cp products.csv2013 s3://$1;
aws s3 cp products.csv2014 s3://$1;
aws s3 cp products.csv2015 s3://$1;
aws s3 cp products.csv2016 s3://$1;
aws s3 cp . s3://$1/ --recursive;

