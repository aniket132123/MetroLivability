import React, { useState, useEffect } from 'react';

function TestData(){

    const [data, loadData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect( () => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:8080/data');

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                
                const response_data = await response.json();

                loadData(response_data);
                
            } catch (error) {
                throw error;
            } finally {
                setLoading(false);
            };
        }

        fetchData();
        
    }, []);

    return (<div>
        <h2>{data}</h2>
    </div>);
}

export default TestData;