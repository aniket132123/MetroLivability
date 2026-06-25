import React, { useState, useEffect } from 'react';

function TestData(){

    const [data, loadData] = useState([]);

    useEffect( () => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:8080/data');

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const response_data = await response.json();

                loadData(response_data);
                
            } catch (error) {
                setError(err.message);
            } finally {
                setLoading(false);
            };
        }
    });

}

export default TestData;