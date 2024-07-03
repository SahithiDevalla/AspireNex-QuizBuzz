import React from 'react';
import './Dashboard.css';
import Sidebar from '../Sidebar/Sidebar';
import axios from 'axios';

export default class Dashboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            quizzes: [],
            isLoading: true
        };
    }

    componentDidMount() {
        this.fetchData();
        // Optionally, you can set an interval to fetch data periodically
        // this.interval = setInterval(this.fetchData, 30000); // fetch data every 30 seconds
    }

    componentWillUnmount() {
        // Clear the interval if you have set one
        // clearInterval(this.interval);
    }

    fetchData = () => {
        axios.get('/api/quizzes/my-quizzes/' + localStorage.getItem('_ID'))
            .then(res => {
                this.setState({ quizzes: res.data, isLoading: false });
            })
            .catch(err => {
                console.error(err);
                this.setState({ isLoading: false });
            });
    };

    render() {
        const { quizzes, isLoading } = this.state;

        return (
            <div className="dashboard-wrapper">
                <Sidebar />
                <div className="main">
                    <div className="header">
                        Dashboard
                    </div>
                    {isLoading ? (
                        <div>Loading...</div>
                    ) : (
                        <div className="quizzes-list">
                            {quizzes.length > 0 ? (
                                quizzes.map((quiz, idx) => (
                                    <div key={idx} className="quiz-card">
                                        <div className="quiz-title">{quiz.name}</div>
                                        <div className="quiz-category">{quiz.category}</div>
                                        <div className="quiz-stats">
                                            <div>{quiz.likes} Likes</div>
                                            <div>{quiz.comments.length} Comments</div>
                                            <div>{quiz.scores.length} Attempts</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div>No quizzes available</div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }
}
