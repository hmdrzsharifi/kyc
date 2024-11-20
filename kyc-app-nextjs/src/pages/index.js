import React from 'react';
import Layout from '../Layout';
import Link from "next/link";

const IndexPage = () => {
    return (
        <Layout>
            <h1 style={{textAlign: 'center', marginBottom: '20px'}}>Welcome to the KYC Management System</h1>
            <p style={{textAlign: 'center', marginBottom: '20px'}}>
                Please register to get started.{' '}
                <Link href="/register" style={{color: 'blue', textDecoration: 'underline'}}>
                    Register
                </Link>
            </p>
        </Layout>
    );
};

export default IndexPage;
