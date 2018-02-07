#!/bin/bash -e

sudo yum install wget -y;
mkdir datalake-data;
cd datalake-data;
wget https://$2.s3.amazonaws.com/$3/customers/customerData.csv;
wget https://$2.s3.amazonaws.com/$3/demographics/demographics_data_20170520.csv;
wget https://$2.s3.amazonaws.com/$3/orders/order_data.csv;
wget https://$2.s3.amazonaws.com/$3/products/products.csv2013;
wget https://$2.s3.amazonaws.com/$3/products/products.csv2014;
wget https://$2.s3.amazonaws.com/$3/products/products.csv2015;
wget https://$2.s3.amazonaws.com/$3/products/products.csv2016;
aws s3 cp demographics_data_20170520.csv s3://$1/demographics/;
aws s3 cp customerData.csv s3://$1/customers/;
aws s3 cp order_data.csv s3://$1/orders/;
aws s3 cp products.csv2013 s3://$1/products/;
aws s3 cp products.csv2014 s3://$1/products/;
aws s3 cp products.csv2015 s3://$1/products/;
aws s3 cp products.csv2016 s3://$1/products/;

